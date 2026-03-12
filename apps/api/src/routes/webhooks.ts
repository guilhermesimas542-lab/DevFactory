import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { WebhookService } from '../services/WebhookService';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/webhooks/github
 * Professional GitHub webhook endpoint for push events
 *
 * Features:
 * - HMAC-SHA256 signature verification
 * - Comprehensive logging and monitoring
 * - Story status auto-update from commits
 * - Error tracking and retry capability
 * - Rate limit checking
 */
/**
 * GET /api/webhooks/:projectId/logs
 * Retrieve recent webhook logs for monitoring
 */
router.get('/:projectId/logs', async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = typeof req.params.projectId === 'string' ? req.params.projectId : '';
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const logs = await prisma.webhookLog.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        github_event_id: true,
        github_event_type: true,
        github_repository: true,
        status: true,
        attempts: true,
        http_status_code: true,
        error_message: true,
        processing_time_ms: true,
        stories_updated: true,
        commits_processed: true,
        created_at: true,
        last_attempt_at: true,
        next_retry_at: true,
      },
    });

    res.json({
      success: true,
      data: {
        total: logs.length,
        limit,
        offset,
        logs,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to get webhook logs:', error);
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

/**
 * GET /api/webhooks/:projectId/stats
 * Retrieve webhook delivery statistics
 */
router.get('/:projectId/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = typeof req.params.projectId === 'string' ? req.params.projectId : '';
    const stats = await WebhookService.getWebhookStats(projectId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to get webhook stats:', error);
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

/**
 * GET /api/webhooks/:projectId/health
 * Retrieve webhook health status
 */
router.get('/:projectId/health', async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = typeof req.params.projectId === 'string' ? req.params.projectId : '';

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        github_webhook_id: true,
        github_webhook_secret: true,
        github_last_sync: true,
      },
    });

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    const recentLogs = await prisma.webhookLog.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: 'desc' },
      take: 10,
    });

    const failedCount = recentLogs.filter(l => l.status === 'failed').length;
    const consecutiveFailures = recentLogs.length > 0 && recentLogs.every(l => l.status === 'failed')
      ? recentLogs.length
      : 0;

    res.json({
      success: true,
      data: {
        connected: project.github_webhook_id !== null,
        webhook_configured: project.github_webhook_secret !== null,
        last_delivery: recentLogs[0]?.created_at || null,
        consecutive_failures: consecutiveFailures,
        total_deliveries: recentLogs.length,
        failed_recent: failedCount,
        health_status: consecutiveFailures === 0 ? 'healthy' : 'unhealthy',
        last_sync: project.github_last_sync,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to get webhook health:', error);
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

router.post('/github', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  let logId: string | null = null;

  try {
    // 1. Extract GitHub headers
    const headerSig = req.headers['x-hub-signature-256'];
    const signature = Array.isArray(headerSig) ? headerSig[0] : headerSig;
    const headerEvent = req.headers['x-github-event'];
    const eventType = Array.isArray(headerEvent) ? headerEvent[0] : headerEvent;
    const headerDelivery = req.headers['x-github-delivery'];
    const eventId = Array.isArray(headerDelivery) ? headerDelivery[0] : headerDelivery;
    const rawBody = JSON.stringify(req.body);
    const payloadSize = Buffer.byteLength(rawBody, 'utf8');

    console.log(`📨 Webhook received: ${eventType} (${eventId?.substring(0, 8)}), payload: ${(payloadSize / 1024).toFixed(2)}KB`);

    // 2. Filter events (process push and pull_request events)
    if (eventType !== 'push' && eventType !== 'pull_request') {
      console.log(`⏭️ Event type '${eventType}' ignored (only 'push' and 'pull_request' processed)`);
      res.status(200).json({
        success: true,
        message: 'Event ignored (only push and pull_request events processed)',
        event: eventType,
      });
      return;
    }

    // 3. Validate required headers
    if (!signature) {
      console.error('❌ Missing X-Hub-Signature-256 header');
      res.status(401).json({ error: 'Missing signature header' });
      return;
    }

    if (!eventId) {
      console.error('❌ Missing X-GitHub-Delivery header');
      res.status(400).json({ error: 'Missing delivery ID' });
      return;
    }

    // 4. Extract repository information
    const repositoryUrl = req.body.repository?.html_url;
    const repositoryFullName = req.body.repository?.full_name || 'unknown';

    if (!repositoryUrl) {
      console.error('❌ Missing repository URL in payload');
      res.status(400).json({ error: 'Missing repository information' });
      return;
    }

    console.log(`🔍 Looking for project with repo: ${repositoryUrl}`);

    // 5. Find project by repository URL
    const project = await prisma.project.findFirst({
      where: { github_repo_url: repositoryUrl },
      include: { stories: { select: { id: true, title: true } } },
    });

    if (!project) {
      console.warn(`⚠️ Webhook for unknown repository: ${repositoryUrl}`);
      res.status(200).json({
        success: true,
        message: 'Project not found',
        repository: repositoryUrl,
      });
      return;
    }

    console.log(`✅ Project found: ${project.name} (${project.id})`);

    // 6. Check for duplicate webhook (idempotency)
    const existingLog = await prisma.webhookLog.findFirst({
      where: {
        project_id: project.id,
        github_event_id: eventId || '',
        status: { in: ['success', 'processing'] as string[] },
      },
    });

    if (existingLog) {
      console.log(`⏭️ Webhook already processed (event ID: ${eventId.substring(0, 8)})`);
      res.status(200).json({
        success: true,
        message: 'Webhook already processed',
        eventId,
        existingLogId: existingLog.id,
      });
      return;
    }

    // 7. Create webhook log entry
    logId = (await WebhookService.logWebhookAttempt(
      project.id,
      eventId,
      eventType,
      repositoryFullName,
      payloadSize,
      'processing'
    ))?.id || null;

    // 8. Verify webhook signature (CRITICAL SECURITY)
    if (!project.github_webhook_secret) {
      console.error(`❌ Project ${project.id} has no webhook secret configured`);
      if (logId) {
        await WebhookService.updateWebhookLog(logId, {
          status: 'failed',
          http_status_code: 401,
          error_message: 'Webhook secret not configured',
          processing_time_ms: Date.now() - startTime,
        });
      }
      res.status(401).json({ error: 'Invalid configuration' });
      return;
    }

    if (!WebhookService.verifySignature(rawBody, signature, project.github_webhook_secret)) {
      console.error(`❌ Invalid signature for project ${project.id}`);
      if (logId) {
        await WebhookService.updateWebhookLog(logId, {
          status: 'failed',
          http_status_code: 401,
          error_message: 'Invalid HMAC signature',
          processing_time_ms: Date.now() - startTime,
        });
      }
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    console.log('✅ Signature verified');

    // 9. Check rate limit before processing
    if (project.github_token) {
      try {
        const decodedToken = Buffer.from(project.github_token, 'base64').toString('utf-8');
        const remaining = await WebhookService.checkRateLimit(decodedToken);
        if (remaining !== null) {
          console.log(`📊 GitHub rate limit: ${remaining} requests remaining`);
        }
      } catch (error) {
        console.warn('⚠️ Could not check rate limit:', error);
      }
    }

    // 10. Process commits and extract story references (for push events)
    const commits = req.body.commits || [];
    const storiesUpdated: any[] = [];
    let commitsProcessed = 0;

    if (eventType === 'push') {
      console.log(`📝 Processing ${commits.length} commits...`);

      for (const commit of commits) {
        const commitMessage = commit.message;
        const commitSha = commit.id.substring(0, 7);
        const storyReferences = WebhookService.extractStoryReferences(commitMessage);

        if (storyReferences.length > 0) {
          commitsProcessed++;
          console.log(`  📌 Commit ${commitSha}: Found ${storyReferences.length} story reference(s)`);

          for (const ref of storyReferences) {
            // Try to find story by ID
            let matchedStory = project.stories.find(
              s => s.id === ref.storyId || s.id.endsWith(ref.storyId)
            );

            // If not found by ID, try by title
            if (!matchedStory) {
              const storyTitle = commitMessage
                .replace(/^(feat|fix|done):\s*/i, '')
                .split('\n')[0]
                .trim();
              matchedStory = project.stories.find(
                s =>
                  s.title.toLowerCase().includes(storyTitle.toLowerCase()) ||
                  storyTitle.toLowerCase().includes(s.title.toLowerCase())
              );
            }

            if (matchedStory) {
              // Update story status
              await prisma.story.update({
                where: { id: matchedStory.id },
                data: {
                  status: ref.status,
                  ...(ref.status === 'in_progress' && { started_at: new Date() }),
                  ...(ref.status === 'completed' && { completed_at: new Date() }),
                },
              });

              console.log(`    ✏️ Story ${matchedStory.id} → ${ref.status}`);

              storiesUpdated.push({
                story_id: matchedStory.id,
                title: matchedStory.title,
                status: ref.status,
                commit_sha: commitSha,
                commit_message: commitMessage.split('\n')[0],
              });
            }
          }
        }
      }
    }

    // 10b. Process pull_request events
    if (eventType === 'pull_request') {
      const prAction = req.body.action;
      const pullRequest = req.body.pull_request;

      if (pullRequest) {
        console.log(`🔀 Processing pull request: ${prAction} - ${pullRequest.title}`);

        const prTitle = pullRequest.title || '';
        const prBody = pullRequest.body || '';
        const prText = `${prTitle}\n${prBody}`;

        const storyReferences = WebhookService.extractStoryReferences(prText);

        if (storyReferences.length > 0) {
          commitsProcessed++;
          console.log(`  📌 PR: Found ${storyReferences.length} story reference(s)`);

          // Determine status based on PR action
          let prStatus = 'in_progress';
          if (prAction === 'closed' && pullRequest.merged === true) {
            prStatus = 'completed';
            console.log(`    ✅ PR merged → marking stories as completed`);
          } else if (prAction === 'opened' || prAction === 'reopened') {
            prStatus = 'in_progress';
            console.log(`    🔄 PR opened/reopened → marking stories as in_progress`);
          }

          for (const ref of storyReferences) {
            // Try to find story by ID
            let matchedStory = project.stories.find(
              s => s.id === ref.storyId || s.id.endsWith(ref.storyId)
            );

            // If not found by ID, try by title
            if (!matchedStory) {
              matchedStory = project.stories.find(
                s =>
                  s.title.toLowerCase().includes(prTitle.toLowerCase()) ||
                  prTitle.toLowerCase().includes(s.title.toLowerCase())
              );
            }

            if (matchedStory) {
              // Update story status
              await prisma.story.update({
                where: { id: matchedStory.id },
                data: {
                  status: prStatus,
                  ...(prStatus === 'in_progress' && { started_at: new Date() }),
                  ...(prStatus === 'completed' && { completed_at: new Date() }),
                },
              });

              console.log(`    ✏️ Story ${matchedStory.id} → ${prStatus}`);

              storiesUpdated.push({
                story_id: matchedStory.id,
                title: matchedStory.title,
                status: prStatus,
                pr_number: pullRequest.number,
                pr_title: prTitle,
              });
            }
          }
        }
      }
    }

    // 11. Update project's last sync time
    await prisma.project.update({
      where: { id: project.id },
      data: { github_last_sync: new Date() },
    });

    // 12. Log success
    const processingTime = Date.now() - startTime;
    console.log(
      `✅ Webhook processed: ${commitsProcessed}/${commits.length} commits, ${storiesUpdated.length} stories updated (${processingTime}ms)`
    );

    if (logId) {
      await WebhookService.updateWebhookLog(logId, {
        status: 'success',
        http_status_code: 200,
        processing_time_ms: processingTime,
        stories_updated: storiesUpdated.length,
        commits_processed: commitsProcessed,
      });
    }

    // 13. Return success response
    res.status(200).json({
      success: true,
      data: {
        event_id: eventId,
        repository: repositoryFullName,
        synced_at: new Date().toISOString(),
        commits_processed: commitsProcessed,
        stories_updated: storiesUpdated.length,
        processing_time_ms: processingTime,
        stories: storiesUpdated,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    const processingTime = Date.now() - startTime;

    console.error(`❌ Webhook processing error: ${message}`, error);

    // Log the error
    if (logId) {
      await WebhookService.updateWebhookLog(logId, {
        status: 'failed',
        http_status_code: 500,
        error_message: message,
        processing_time_ms: processingTime,
      });
    }

    // Return 200 to acknowledge receipt (GitHub retry logic)
    // but indicate failure in response body
    res.status(200).json({
      success: false,
      error: message,
      processing_time_ms: processingTime,
    });
  }
});

export default router;

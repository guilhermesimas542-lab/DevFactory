import { Router, Request, Response } from 'express';
import { createHmac } from 'crypto';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Verify GitHub webhook signature
 * GitHub sends X-Hub-Signature-256 header with HMAC-SHA256 signature
 */
function verifyGitHubSignature(body: string, signature: string, secret: string): boolean {
  try {
    const hmac = createHmac('sha256', secret);
    hmac.update(body);
    const digest = `sha256=${hmac.digest('hex')}`;

    // Use timingSafeEqual to prevent timing attacks
    return digest === signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * POST /api/webhooks/github
 * GitHub webhook endpoint for push events
 * PUBLIC endpoint - no authentication required
 * Signature verification is MANDATORY
 */
router.post('/github', async (req: Request, res: Response): Promise<void> => {
  try {
    // Get signature from GitHub headers
    const signature = req.headers['x-hub-signature-256'] as string;
    const event = req.headers['x-github-event'] as string;

    // Only handle push events
    if (event !== 'push') {
      res.status(200).json({
        message: 'Event ignored (only push events processed)',
        event
      });
      return;
    }

    if (!signature) {
      res.status(401).json({ error: 'Missing signature header' });
      return;
    }

    // Get raw body for signature verification
    const rawBody = JSON.stringify(req.body);

    // Extract repository URL from payload
    const repositoryUrl = req.body.repository?.html_url;
    if (!repositoryUrl) {
      res.status(400).json({ error: 'Missing repository information' });
      return;
    }

    // Find project by repository URL
    const project = await prisma.project.findFirst({
      where: { github_repo_url: repositoryUrl },
      include: { stories: { select: { id: true, title: true } } },
    });

    if (!project) {
      // Log but don't reveal project lookup failure (security)
      console.warn(`Webhook received for unknown repository: ${repositoryUrl}`);
      res.status(200).json({ message: 'Project not found' });
      return;
    }

    // Verify signature using project's webhook secret
    if (!project.github_webhook_secret) {
      console.error(`Project ${project.id} has no webhook secret`);
      res.status(401).json({ error: 'Invalid configuration' });
      return;
    }

    if (!verifyGitHubSignature(rawBody, signature, project.github_webhook_secret)) {
      console.warn(`Invalid signature for project ${project.id}`);
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    // Extract commits from payload
    const commits = req.body.commits || [];

    // Process commits and update stories
    const storiesUpdated = [];

    for (const commit of commits) {
      const commitMessage = commit.message.toLowerCase();
      let newStatus: string | null = null;

      // Check for status patterns
      if (commitMessage.match(/^done:\s*story-(\w+)/i) || commitMessage.match(/^done:\s*story/i)) {
        newStatus = 'completed';
      } else if (commitMessage.match(/^fix:\s*story-(\w+)/i) || commitMessage.match(/^fix:\s*story/i)) {
        newStatus = 'completed';
      } else if (commitMessage.match(/^feat:\s*story-(\w+)/i) || commitMessage.match(/^feat:\s*story/i)) {
        newStatus = 'in_progress';
      }

      if (newStatus) {
        // Extract story ID from message
        const storyIdMatch = commitMessage.match(/story-(\w+)/);
        let matchedStory = null;

        if (storyIdMatch) {
          // Try to match by story ID
          matchedStory = project.stories.find(s => s.id === storyIdMatch[1] || s.id.endsWith(storyIdMatch[1]));
        }

        // If not found by ID, try to match by title
        if (!matchedStory) {
          const storyTitle = commitMessage.replace(/^(feat|fix|done):\s*/i, '').split('\n')[0].trim();
          matchedStory = project.stories.find(s =>
            s.title.toLowerCase().includes(storyTitle.toLowerCase()) ||
            storyTitle.toLowerCase().includes(s.title.toLowerCase())
          );
        }

        if (matchedStory) {
          // Update story status
          await prisma.story.update({
            where: { id: matchedStory.id },
            data: {
              status: newStatus,
              ...(newStatus === 'in_progress' && { started_at: new Date() }),
              ...(newStatus === 'completed' && { completed_at: new Date() }),
            },
          });

          storiesUpdated.push({
            story_id: matchedStory.id,
            title: matchedStory.title,
            new_status: newStatus,
            commit_sha: commit.id.substring(0, 7),
            commit_message: commit.message.split('\n')[0],
          });
        }
      }
    }

    // Update project's last sync time
    await prisma.project.update({
      where: { id: project.id },
      data: { github_last_sync: new Date() },
    });

    res.status(200).json({
      success: true,
      data: {
        synced_at: new Date().toISOString(),
        commits_processed: commits.length,
        stories_updated: storiesUpdated,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Webhook processing error:', error);

    // Return 200 to acknowledge receipt but log the error
    res.status(200).json({
      success: false,
      error: message,
    });
  }
});

export default router;

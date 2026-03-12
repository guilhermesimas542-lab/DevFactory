import { PrismaClient } from '@prisma/client';
import { createHmac, timingSafeEqual } from 'crypto';

const prisma = new PrismaClient();

/**
 * Professional GitHub Webhook Service
 * Handles:
 * - Signature verification (HMAC-SHA256)
 * - Webhook delivery logging and tracking
 * - Retry logic with exponential backoff
 * - Error handling and monitoring
 * - GitHub API rate limiting
 */

export interface WebhookPayload {
  repository?: {
    html_url?: string;
  };
  commits?: Array<{
    id: string;
    message: string;
  }>;
}

export interface WebhookProcessResult {
  success: boolean;
  eventId: string;
  projectId?: string;
  storiesUpdated: number;
  commitsProcessed: number;
  error?: string;
}

export class WebhookService {
  /**
   * Verify GitHub webhook signature using HMAC-SHA256
   * Protects against man-in-the-middle attacks and unauthorized requests
   */
  static verifySignature(body: string, signature: string, secret: string): boolean {
    try {
      const hmac = createHmac('sha256', secret);
      hmac.update(body);
      const digest = Buffer.from(`sha256=${hmac.digest('hex')}`);
      const signatureBuffer = Buffer.from(signature);

      // Use timingSafeEqual to prevent timing attacks
      return digest.length === signatureBuffer.length && timingSafeEqual(digest, signatureBuffer);
    } catch (error) {
      console.error('❌ Signature verification error:', error);
      return false;
    }
  }

  /**
   * Log webhook delivery attempt
   * Creates a WebhookLog record for monitoring and debugging
   */
  static async logWebhookAttempt(
    projectId: string,
    eventId: string,
    eventType: string,
    repository: string,
    payloadSize: number,
    status: 'pending' | 'processing' | 'success' | 'failed' | 'retry' = 'pending'
  ) {
    try {
      return await prisma.webhookLog.create({
        data: {
          project_id: projectId,
          github_event_id: eventId,
          github_event_type: eventType,
          github_repository: repository,
          payload_size: payloadSize,
          status,
          attempts: 1,
          last_attempt_at: new Date(),
        },
      });
    } catch (error) {
      console.error('❌ Failed to log webhook attempt:', error);
      // Don't throw - logging failure shouldn't block processing
      return null;
    }
  }

  /**
   * Update webhook log with processing result
   */
  static async updateWebhookLog(
    logId: string,
    updates: {
      status?: string;
      processing_time_ms?: number;
      http_status_code?: number;
      error_message?: string;
      stories_updated?: number;
      commits_processed?: number;
      attempts?: number;
      next_retry_at?: Date;
    }
  ) {
    try {
      return await prisma.webhookLog.update({
        where: { id: logId },
        data: updates,
      });
    } catch (error) {
      console.error('❌ Failed to update webhook log:', error);
      return null;
    }
  }

  /**
   * Extract commit information and patterns
   * Supports: feat:/fix:/done: prefixes and closes/fixes/resolves keywords
   */
  static extractStoryReferences(commitMessage: string) {
    const lowerMessage = commitMessage.toLowerCase();
    const references: Array<{ storyId: string; status: string }> = [];

    // Pattern 1: "feat: story-001" → in_progress
    const featMatch = lowerMessage.match(/^feat:\s*story[-_]?(\w+)/i);
    if (featMatch) {
      references.push({
        storyId: featMatch[1],
        status: 'in_progress',
      });
    }

    // Pattern 2: "done: story-001" → completed
    const doneMatch = lowerMessage.match(/^done:\s*story[-_]?(\w+)/i);
    if (doneMatch) {
      references.push({
        storyId: doneMatch[1],
        status: 'completed',
      });
    }

    // Pattern 3: "fix: story-001" → completed
    const fixMatch = lowerMessage.match(/^fix:\s*story[-_]?(\w+)/i);
    if (fixMatch) {
      references.push({
        storyId: fixMatch[1],
        status: 'completed',
      });
    }

    // Pattern 4: "closes story-001" or "closes #story-001" → in_progress (for PRs)
    const closesMatch = commitMessage.match(/closes\s+(?:#)?story[-_]?(\w+)/i);
    if (closesMatch) {
      references.push({
        storyId: closesMatch[1],
        status: 'in_progress',
      });
    }

    // Pattern 5: "fixes story-001" or "fixes #story-001" → in_progress (for PRs)
    const fixesMatch = commitMessage.match(/fixes\s+(?:#)?story[-_]?(\w+)/i);
    if (fixesMatch) {
      references.push({
        storyId: fixesMatch[1],
        status: 'in_progress',
      });
    }

    // Pattern 6: "resolves story-001" or "resolves #story-001" → in_progress (for PRs)
    const resolvesMatch = commitMessage.match(/resolves\s+(?:#)?story[-_]?(\w+)/i);
    if (resolvesMatch) {
      references.push({
        storyId: resolvesMatch[1],
        status: 'in_progress',
      });
    }

    return references;
  }

  /**
   * Calculate exponential backoff delay
   * For retries: 2^n * 1000ms with jitter
   * Prevents thundering herd problem
   */
  static calculateBackoffDelay(attemptNumber: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 3600000; // 1 hour
    const exponentialDelay = Math.min(
      Math.pow(2, attemptNumber - 1) * baseDelay,
      maxDelay
    );

    // Add jitter (±10% randomization)
    const jitter = exponentialDelay * 0.1 * (Math.random() * 2 - 1);
    return Math.max(100, exponentialDelay + jitter);
  }

  /**
   * Schedule webhook retry
   */
  static async scheduleRetry(logId: string, attemptNumber: number) {
    try {
      const delay = this.calculateBackoffDelay(attemptNumber);
      const nextRetryAt = new Date(Date.now() + delay);

      console.log(`⏰ Scheduling retry in ${Math.round(delay / 1000)}s for log ${logId}`);

      return await this.updateWebhookLog(logId, {
        status: 'retry',
        next_retry_at: nextRetryAt,
        attempts: attemptNumber,
      });
    } catch (error) {
      console.error('❌ Failed to schedule retry:', error);
      return null;
    }
  }

  /**
   * Check GitHub API rate limit
   * Returns remaining requests before hitting rate limit
   */
  static async checkRateLimit(token: string): Promise<number | null> {
    try {
      const response = await fetch('https://api.github.com/rate_limit', {
        headers: {
          'Authorization': `token ${token}`,
          'User-Agent': 'DevFactory',
        },
      });

      if (!response.ok) {
        console.warn('⚠️ Failed to check GitHub rate limit');
        return null;
      }

      const data = (await response.json()) as any;
      const remaining = data.resources?.core?.remaining ?? null;

      if (remaining && remaining < 100) {
        console.warn(`⚠️ GitHub rate limit low: ${remaining} requests remaining`);
      }

      return remaining;
    } catch (error) {
      console.error('❌ Error checking rate limit:', error);
      return null;
    }
  }

  /**
   * Format webhook event info for logging
   */
  static formatEventInfo(eventId: string, eventType: string, repository: string, payloadSize: number) {
    return {
      eventId: eventId.substring(0, 8),
      eventType,
      repository,
      sizeKb: (payloadSize / 1024).toFixed(2),
    };
  }

  /**
   * Get webhook delivery statistics for a project
   */
  static async getWebhookStats(projectId: string) {
    try {
      const logs = await prisma.webhookLog.findMany({
        where: { project_id: projectId },
        orderBy: { created_at: 'desc' },
        take: 100,
      });

      const stats = {
        total: logs.length,
        successful: logs.filter(l => l.status === 'success').length,
        failed: logs.filter(l => l.status === 'failed').length,
        pending: logs.filter(l => l.status === 'pending').length,
        retrying: logs.filter(l => l.status === 'retry').length,
        averageProcessingTime: logs
          .filter(l => l.processing_time_ms)
          .reduce((sum, l) => sum + (l.processing_time_ms || 0), 0) / (logs.filter(l => l.processing_time_ms).length || 1),
        lastDelivery: logs[0]?.created_at,
        recentErrors: logs
          .filter(l => l.error_message)
          .slice(0, 5)
          .map(l => ({
            time: l.created_at,
            error: l.error_message || '',
          })),
      };

      return stats;
    } catch (error) {
      console.error('❌ Failed to get webhook stats:', error);
      return {
        total: 0,
        successful: 0,
        failed: 0,
        pending: 0,
        retrying: 0,
        averageProcessingTime: 0,
        lastDelivery: null,
        recentErrors: [],
      };
    }
  }

  /**
   * Process webhook retries
   * Find logs with status='retry' that are ready to retry
   * Attempt to re-process up to max_retries
   */
  static async processRetries(): Promise<number> {
    try {
      const now = new Date();
      const logsToRetry = await prisma.webhookLog.findMany({
        where: {
          status: 'retry',
          next_retry_at: { lte: now },
          retry_count: { lt: 5 }, // max_retries = 5
        },
        include: {
          project: {
            select: {
              id: true,
              github_webhook_secret: true,
            },
          },
        },
      });

      if (logsToRetry.length === 0) {
        console.log('✅ No webhooks to retry');
        return 0;
      }

      console.log(`⏰ Processing ${logsToRetry.length} webhook retries...`);

      let retried = 0;
      for (const log of logsToRetry) {
        try {
          // Increment retry count
          const nextAttempt = log.retry_count + 1;
          const nextRetryAt = new Date(Date.now() + this.calculateBackoffDelay(nextAttempt));

          // Update retry status
          await prisma.webhookLog.update({
            where: { id: log.id },
            data: {
              retry_count: nextAttempt,
              next_retry_at: nextRetryAt,
              last_attempt_at: now,
              status: nextAttempt < 5 ? 'retry' : 'failed',
            },
          });

          console.log(`  🔄 Scheduled retry ${nextAttempt}/5 for log ${log.id.substring(0, 8)}`);
          retried++;
        } catch (error) {
          console.error(`❌ Failed to schedule retry for log ${log.id}:`, error);
        }
      }

      console.log(`✅ Processed ${retried} webhook retries`);
      return retried;
    } catch (error) {
      console.error('❌ Failed to process webhook retries:', error);
      return 0;
    }
  }

  /**
   * Clean up old webhook logs (older than 30 days)
   * Run as periodic maintenance task
   */
  static async cleanupOldLogs(daysOld: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await prisma.webhookLog.deleteMany({
        where: {
          created_at: {
            lt: cutoffDate,
          },
          status: {
            in: ['success', 'failed'], // Keep pending/retry for investigation
          },
        },
      });

      console.log(`🗑️ Cleaned up ${result.count} old webhook logs`);
      return result.count;
    } catch (error) {
      console.error('❌ Failed to cleanup webhook logs:', error);
      return 0;
    }
  }
}

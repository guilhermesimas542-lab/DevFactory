import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/debug/github-status
 * Diagnóstico completo da integração GitHub
 */
router.get('/github-status', async (_req: Request, res: Response): Promise<void> => {
  try {
    const tokenConfigured = !!process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== 'ghp_COLOQUE_SEU_TOKEN_AQUI';
    const webhookSecretConfigured = !!process.env.GITHUB_WEBHOOK_SECRET && process.env.GITHUB_WEBHOOK_SECRET !== 'sua-chave-secreta-para-validar-webhooks';

    // Projetos com GitHub configurado
    const projectsWithGitHub = await prisma.project.findMany({
      where: {
        github_repo_url: { not: null }
      },
      select: {
        id: true,
        name: true,
        github_repo_url: true,
        github_last_sync: true,
        github_token: true,
      }
    });

    // Webhook logs das últimas 24 horas
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const webhookLogs = await prisma.webhookLog.findMany({
      where: {
        created_at: { gte: last24h }
      },
      select: {
        id: true,
        status: true,
        github_event_type: true,
        stories_updated: true,
        error_message: true,
        created_at: true,
      }
    });

    const response_data = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      configuration: {
        token_configured: tokenConfigured,
        token_status: tokenConfigured ? '✅ Configurado' : '❌ Não configurado',
        webhook_secret_configured: webhookSecretConfigured,
        webhook_secret_status: webhookSecretConfigured ? '✅ Configurado' : '❌ Não configurado',
      },
      projects: {
        total_with_github: projectsWithGitHub.length,
        list: projectsWithGitHub.map((p) => ({
          id: p.id,
          name: p.name,
          github_repo_url: p.github_repo_url,
          last_sync: p.github_last_sync?.toISOString() || 'Nunca',
          has_personal_token: !!p.github_token,
        }))
      },
      webhook: {
        logs_last_24h: webhookLogs.length,
        successful: webhookLogs.filter(l => l.status === 'success').length,
        failed: webhookLogs.filter(l => l.status === 'failed').length,
        pending: webhookLogs.filter(l => l.status === 'pending').length,
        recent_logs: webhookLogs.slice(0, 5).map((l) => ({
          id: l.id,
          status: l.status,
          event_type: l.github_event_type,
          stories_updated: l.stories_updated,
          error: l.error_message,
          timestamp: l.created_at.toISOString(),
        }))
      },
      diagnostics: {
        ready_for_sync: tokenConfigured && projectsWithGitHub.length > 0,
        messages: [
          !tokenConfigured ? '⚠️ GITHUB_TOKEN não configurado. Job sincronizará mas sem autenticação (rate limit 60req/h)' : '✅ Token GitHub configurado',
          projectsWithGitHub.length === 0 ? '⚠️ Nenhum projeto com github_repo_url. Configure URLs para começar!' : `✅ ${projectsWithGitHub.length} projeto(s) pronto(s) para sincronizar`,
          !webhookSecretConfigured ? '⚠️ Webhook secret não configurado. Webhooks não serão validados!' : '✅ Webhooks configurados',
        ]
      }
    };

    res.status(200).json(response_data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Debug error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

export default router;

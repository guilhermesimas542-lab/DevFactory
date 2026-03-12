-- Add unique index for webhook idempotency (prevent duplicate processing)
CREATE UNIQUE INDEX "WebhookLog_project_id_github_event_id_key" ON "WebhookLog"("project_id", "github_event_id");

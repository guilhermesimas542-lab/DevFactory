-- AlterTable
ALTER TABLE "Project" ADD COLUMN "github_token" TEXT,
ADD COLUMN "github_webhook_id" INTEGER,
ADD COLUMN "github_webhook_secret" TEXT;

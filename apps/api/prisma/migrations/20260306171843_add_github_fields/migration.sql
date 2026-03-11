-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "github_last_sync" TIMESTAMP(3),
ADD COLUMN     "github_repo_url" TEXT;

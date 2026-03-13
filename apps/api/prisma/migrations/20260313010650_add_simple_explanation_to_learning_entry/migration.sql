-- DropIndex
DROP INDEX "GlossaryTerm_project_id_category_idx";

-- AlterTable
ALTER TABLE "GlossaryTerm" ALTER COLUMN "category" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "LearningEntry" ADD COLUMN     "simple_explanation" TEXT;

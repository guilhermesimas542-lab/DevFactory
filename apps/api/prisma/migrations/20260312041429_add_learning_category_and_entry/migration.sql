-- DropIndex
DROP INDEX "Alert_is_read_idx";

-- DropIndex
DROP INDEX "Alert_project_id_idx";

-- DropIndex
DROP INDEX "AnalysisResult_project_id_module_id_idx";

-- DropIndex
DROP INDEX "Component_module_id_idx";

-- DropIndex
DROP INDEX "Module_project_id_idx";

-- DropIndex
DROP INDEX "Project_name_idx";

-- DropIndex
DROP INDEX "Story_project_id_idx";

-- CreateTable
CREATE TABLE "LearningCategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningEntry" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'article',
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LearningCategory_title_key" ON "LearningCategory"("title");

-- AddForeignKey
ALTER TABLE "LearningEntry" ADD CONSTRAINT "LearningEntry_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "LearningCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

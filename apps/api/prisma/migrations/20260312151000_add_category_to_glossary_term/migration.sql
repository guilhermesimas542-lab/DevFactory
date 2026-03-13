-- Add category field to GlossaryTerm with predefined categories
ALTER TABLE "GlossaryTerm" ADD COLUMN "category" VARCHAR(50) NOT NULL DEFAULT 'geral';

-- Create index on category for filtering queries
CREATE INDEX "GlossaryTerm_project_id_category_idx" ON "GlossaryTerm"("project_id", "category");

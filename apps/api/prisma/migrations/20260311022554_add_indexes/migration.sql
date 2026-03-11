-- CreateIndex
CREATE INDEX "Alert_project_id_idx" ON "Alert"("project_id");

-- CreateIndex
CREATE INDEX "Alert_is_read_idx" ON "Alert"("is_read");

-- CreateIndex
CREATE INDEX "AnalysisResult_project_id_module_id_idx" ON "AnalysisResult"("project_id", "module_id");

-- CreateIndex
CREATE INDEX "Component_module_id_idx" ON "Component"("module_id");

-- CreateIndex
CREATE INDEX "Module_project_id_idx" ON "Module"("project_id");

-- CreateIndex
CREATE INDEX "Project_name_idx" ON "Project"("name");

-- CreateIndex
CREATE INDEX "Story_project_id_idx" ON "Story"("project_id");

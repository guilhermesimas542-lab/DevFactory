// API client for DevFactory frontend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Upload PRD file to backend
 * @param file - The PRD file (markdown or text) * @returns Project ID and status
 */
export async function uploadPRD(file: File): Promise<ApiResponse<{ projectId: string; status: string }>> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/projects/import-prd`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type header - browser will set it automatically
        // with the correct boundary for multipart/form-data
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed with status ${response.status}`);
    }

    const responseData = await response.json();
    return {
      success: true,
      data: {
        projectId: responseData.projectId,
        status: responseData.status,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Get all projects
 * @returns Array of projects
 */
export async function getProjects(): Promise<ApiResponse<Array<{
  id: string;
  name: string;
  description: string | null;
  github_repo_url: string | null;
  created_at: string;
  _count: { modules: number };
}>>> {
  return apiCall('/api/projects');
}

/**
 * Get a specific project by ID
 * @param projectId - The project ID
 * @returns Project details
 */
export async function getProject(projectId: string): Promise<ApiResponse<{
  id: string;
  name: string;
  description: string | null;
  github_repo_url: string | null;
  github_last_sync: string | null;
  prd_original: any;
  modules: Array<{
    id: string;
    name: string;
    description: string | null;
    hierarchy: string;
    components: Array<{
      id: string;
      name: string;
    }>;
  }>;
  created_at: string;
  updated_at: string;
}>> {
  return apiCall(`/api/projects/${projectId}`);
}

/**
 * Delete a project
 * @param projectId - The project ID to delete
 * @returns Success status
 */
export async function deleteProject(projectId: string): Promise<ApiResponse<{ message: string }>> {
  return apiCall(`/api/projects/${projectId}`, {
    method: 'DELETE',
  });
}

/**
 * Generic fetch wrapper for API calls
 */
export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const responseData = await response.json();
    return {
      success: true,
      data: responseData.data,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Validate and update project tree with user edits
 * @param projectId - The project ID
 * @param updates - Array of module/component updates
 * @returns Success status and number of modules updated
 */
export async function validateProjectTree(
  projectId: string,
  updates: Array<{
    moduleId: string;
    name?: string;
    hierarchy?: string;
    components?: Array<{ componentId: string; name: string }>;
  }>
): Promise<ApiResponse<{ modulesUpdated: number }>> {
  try {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updates }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Validation failed with status ${response.status}`);
    }

    const responseData = await response.json();
    return {
      success: true,
      data: {
        modulesUpdated: responseData.modulesUpdated,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Get project progress
 * @param projectId - The project ID
 * @returns Progress data with overall %, by module, and deviations
 */
export async function getProgress(projectId: string): Promise<ApiResponse<{
  projectId: string;
  projectName: string;
  overall: number;
  by_module: Record<string, number>;
  modules: Array<{
    moduleId: string;
    name: string;
    hierarchy: string;
    progress: number;
    componentCount: number;
  }>;
  deviations: Array<{
    moduleId: string;
    name: string;
    currentProgress: number;
    expectedProgress: number;
    gap: number;
  }>;
  timestamp: string;
}>> {
  return apiCall(`/api/projects/${projectId}/progress`);
}

/**
 * Get stories for a project with optional filters
 * @param projectId - The project ID
 * @param filters - Optional filters (status, agent, moduleId)
 * @returns Array of stories
 */
export async function getStories(
  projectId: string,
  filters?: { status?: string; agent?: string; moduleId?: string }
): Promise<ApiResponse<Array<{
  id: string;
  project_id: string;
  module_id: string | null;
  title: string;
  description: string | null;
  epic: string | null;
  status: string;
  agent_responsible: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}>>> {
  const params = new URLSearchParams({ projectId });
  if (filters?.status) params.append('status', filters.status);
  if (filters?.agent) params.append('agent', filters.agent);
  if (filters?.moduleId) params.append('moduleId', filters.moduleId);
  return apiCall(`/api/stories?${params.toString()}`);
}

/**
 * Get a specific story by ID
 * @param storyId - The story ID
 * @returns Story details
 */
export async function getStory(storyId: string): Promise<ApiResponse<{
  id: string;
  project_id: string;
  module_id: string | null;
  title: string;
  description: string | null;
  epic: string | null;
  status: string;
  agent_responsible: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}>> {
  return apiCall(`/api/stories/${storyId}`);
}

/**
 * Create a new story
 * @param story - Story data
 * @returns Created story
 */
export async function createStory(story: {
  projectId: string;
  moduleId?: string;
  title: string;
  description?: string;
  epic?: string;
  status?: string;
  agentResponsible?: string;
}): Promise<ApiResponse<any>> {
  return apiCall('/api/stories', {
    method: 'POST',
    body: JSON.stringify(story),
  });
}

/**
 * Update a story
 * @param storyId - The story ID
 * @param updates - Fields to update
 * @returns Updated story
 */
export async function updateStory(
  storyId: string,
  updates: {
    title?: string;
    description?: string;
    epic?: string;
    status?: string;
    agentResponsible?: string;
    moduleId?: string;
    startedAt?: string;
    completedAt?: string;
  }
): Promise<ApiResponse<any>> {
  return apiCall(`/api/stories/${storyId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * Delete a story
 * @param storyId - The story ID to delete
 * @returns Success message
 */
export async function deleteStory(storyId: string): Promise<ApiResponse<{ message: string }>> {
  return apiCall(`/api/stories/${storyId}`, {
    method: 'DELETE',
  });
}

/**
 * Get timeline data for a project
 * @param projectId - The project ID
 * @returns Timeline metrics and story groupings
 */
export async function getStoryTimeline(projectId: string): Promise<ApiResponse<{
  total: number;
  byStatus: {
    pending: any[];
    in_progress: any[];
    completed: any[];
  };
  completionRate: number;
  avgDaysToCompletion: number;
  totalCompleted: number;
  totalPending: number;
  totalInProgress: number;
}>> {
  return apiCall(`/api/stories/${projectId}/timeline`);
}

/**
 * Get alerts for a project
 * @param projectId - The project ID
 * @param unreadOnly - Optional filter for unread alerts only
 * @returns Array of alerts
 */
export async function getAlerts(projectId: string, unreadOnly?: boolean): Promise<ApiResponse<Array<{
  id: string;
  project_id: string;
  type: string;
  severity: string;
  message: string;
  module_id: string | null;
  is_read: boolean;
  created_at: string;
}>>> {
  const params = new URLSearchParams({ projectId });
  if (unreadOnly) params.append('unreadOnly', 'true');
  return apiCall(`/api/alerts?${params.toString()}`);
}

/**
 * Get a specific alert by ID
 * @param alertId - The alert ID
 * @returns Alert details
 */
export async function getAlert(alertId: string): Promise<ApiResponse<any>> {
  return apiCall(`/api/alerts/${alertId}`);
}

/**
 * Create a new alert
 * @param alert - Alert data
 * @returns Created alert
 */
export async function createAlert(alert: {
  projectId: string;
  type: string;
  severity?: string;
  message: string;
  moduleId?: string;
}): Promise<ApiResponse<any>> {
  return apiCall('/api/alerts', {
    method: 'POST',
    body: JSON.stringify(alert),
  });
}

/**
 * Mark an alert as read/unread
 * @param alertId - The alert ID
 * @param isRead - Whether to mark as read
 * @returns Updated alert
 */
export async function updateAlert(alertId: string, isRead: boolean): Promise<ApiResponse<any>> {
  return apiCall(`/api/alerts/${alertId}`, {
    method: 'PUT',
    body: JSON.stringify({ isRead }),
  });
}

/**
 * Delete an alert
 * @param alertId - The alert ID to delete
 * @returns Success message
 */
export async function deleteAlert(alertId: string): Promise<ApiResponse<{ message: string }>> {
  return apiCall(`/api/alerts/${alertId}`, {
    method: 'DELETE',
  });
}

/**
 * Check and generate alerts for a project
 * @param projectId - The project ID
 * @returns Generated alerts
 */
export async function checkAlerts(projectId: string): Promise<ApiResponse<{
  checked: boolean;
  alertsGenerated: number;
  alerts: any[];
}>> {
  return apiCall(`/api/alerts/check/${projectId}`, {
    method: 'POST',
  });
}

/**
 * Get glossary terms for a project
 * @param projectId - The project ID
 * @returns Array of glossary terms
 */
export async function getGlossaryTerms(projectId: string): Promise<ApiResponse<Array<{
  id: string;
  project_id: string;
  term: string;
  definition: string;
  analogy: string | null;
  relevance: string | null;
  is_explored: boolean;
  created_at: string;
}>>> {
  return apiCall(`/api/glossary?projectId=${projectId}`);
}

/**
 * Get a specific glossary term by ID
 * @param termId - The term ID
 * @returns Term details
 */
export async function getGlossaryTerm(termId: string): Promise<ApiResponse<any>> {
  return apiCall(`/api/glossary/${termId}`);
}

/**
 * Create a new glossary term
 * @param term - Term data
 * @returns Created term
 */
export async function createGlossaryTerm(term: {
  projectId: string;
  term: string;
  definition: string;
  analogy?: string;
  relevance?: string;
}): Promise<ApiResponse<any>> {
  return apiCall('/api/glossary', {
    method: 'POST',
    body: JSON.stringify(term),
  });
}

/**
 * Update a glossary term
 * @param termId - The term ID
 * @param updates - Fields to update
 * @returns Updated term
 */
export async function updateGlossaryTerm(
  termId: string,
  updates: {
    term?: string;
    definition?: string;
    analogy?: string;
    relevance?: string;
    isExplored?: boolean;
  }
): Promise<ApiResponse<any>> {
  return apiCall(`/api/glossary/${termId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * Delete a glossary term
 * @param termId - The term ID to delete
 * @returns Success message
 */
export async function deleteGlossaryTerm(termId: string): Promise<ApiResponse<{ message: string }>> {
  return apiCall(`/api/glossary/${termId}`, {
    method: 'DELETE',
  });
}

/**
 * Sync project with GitHub commits
 * @param projectId - The project ID
 * @returns Sync results with updated stories
 */
export async function syncProjectGitHub(projectId: string): Promise<ApiResponse<{
  synced_at: string;
  commits_analyzed: number;
  stories_updated: Array<{
    story_id: string;
    title: string;
    new_status: string;
    commit_sha: string;
    commit_message: string;
  }>;
}>> {
  return apiCall(`/api/projects/${projectId}/sync-github`, {
    method: 'POST',
  });
}

/**
 * Update a project
 * @param projectId - The project ID
 * @param updates - Fields to update
 * @returns Updated project
 */
export async function updateProject(
  projectId: string,
  updates: {
    name?: string;
    description?: string;
    github_repo_url?: string;
  }
): Promise<ApiResponse<any>> {
  return apiCall(`/api/projects/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * Get available AI providers
 * @returns List of available providers and default provider
 */
export async function getAIProviders(): Promise<ApiResponse<{
  available: string[];
  default: string;
}>> {
  return apiCall('/api/chat/providers');
}

/**
 * Extract architecture from PRD using specified AI provider
 * @param projectId - The project ID
 * @param provider - Optional AI provider (gemini or groq, default is best available)
 * @returns Architecture data with nodes and connections
 */
export async function extractArchitecture(
  projectId: string,
  provider?: string
): Promise<ApiResponse<{
  architecture: {
    nodes: Array<{
      id: string;
      label: string;
      type: string;
      description: string;
      why: string;
      parentId: string | null;
      components: Array<{
        name: string;
        description: string;
        status: string;
      }>;
    }>;
    connections: Array<{
      from: string;
      to: string;
    }>;
    provider: string;
  };
  modulesCreated: number;
  timestamp: string;
}>> {
  return apiCall(`/api/projects/${projectId}/extract-architecture`, {
    method: 'POST',
    body: JSON.stringify({ provider }),
  });
}

/**
 * Send a chat message to AI and get response
 * @param projectId - The project ID
 * @param message - The user's message
 * @param history - Previous chat messages for context
 * @param provider - Optional AI provider (gemini or groq, default is best available)
 * @returns AI response message
 */
export async function sendChatMessage(
  projectId: string,
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  provider?: string
): Promise<ApiResponse<{ message: string }>> {
  return apiCall('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ projectId, message, history, provider }),
  });
}

/**
 * Get activity log for a project
 * @param projectId - The project ID
 * @param limit - Maximum number of entries to return (default 50, max 100)
 * @returns Array of activity log entries
 */
export async function getActivityLog(
  projectId: string,
  limit: number = 50
): Promise<ApiResponse<Array<{
  id: string;
  type: string;
  description: string;
  metadata: Record<string, any> | null;
  created_at: string;
}> & { total: number }>> {
  return apiCall(`/api/activity?projectId=${projectId}&limit=${limit}`);
}

export async function analyzeProject(projectId: string): Promise<ApiResponse<{
  projectId: string;
  patternsFound: number;
  moduleProgress: Record<string, number>;
  alerts: string[];
  timestamp: string;
}>> {
  try {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error || 'Analysis failed' };
    }
    return { success: true, data: data.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { success: false, error: message };
  }
}

/**
 * Connect a GitHub repository with webhook
 * Registers a webhook and stores authentication credentials
 * @param projectId - Project ID
 * @param githubToken - Personal Access Token from GitHub
 * @returns Webhook connection status
 */
export async function connectGitHub(
  projectId: string,
  githubToken: string
): Promise<ApiResponse<{
  connected: boolean;
  webhook_id: number;
  repository: string;
  webhook_url: string;
}>> {
  try {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/connect-github`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ github_token: githubToken }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to connect GitHub' };
    }
    return { success: true, data: data.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { success: false, error: message };
  }
}

/**
 * Disconnect GitHub webhook and remove credentials
 * @param projectId - Project ID
 * @returns Disconnection status
 */
export async function disconnectGitHub(
  projectId: string
): Promise<ApiResponse<{
  disconnected: boolean;
  repository: string;
}>> {
  try {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/disconnect-github`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to disconnect GitHub' };
    }
    return { success: true, data: data.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { success: false, error: message };
  }
}

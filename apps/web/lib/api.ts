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
  created_at: string;
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

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

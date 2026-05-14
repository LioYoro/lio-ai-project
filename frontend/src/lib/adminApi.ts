import apiClient from './api';

export interface AdminStats {
  users_count: number;
  total_documents: number;
  documents_by_status: Record<string, number>;
  documents_today: number;
  avg_processing_time_seconds: number | null;
  document_type_breakdown: Record<string, number>;
  file_type_breakdown: Record<string, number>;
  users_by_month: Record<string, number>;
  documents_by_month: Record<string, number>;
  extracted_document_types: Record<string, number>;
}

export interface AdminDocument {
  id: string;
  filename: string;
  file_size: number;
  owner_email: string;
  status: 'processing' | 'completed' | 'failed' | 'pending';
  document_type: string | null;
  notes: string | null;
  is_verified: boolean;
  confidence_score: number | null;
  extracted_data: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  document_id: string | null;
  document_name: string | null;
  action: string;
  details: Record<string, any> | null;
  created_at: string;
}

export interface AdminDocumentUpdate {
  document_type?: string | null;
  notes?: string | null;
  is_verified?: boolean;
}

// Get admin stats
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await apiClient.get('/api/admin/stats');
  return response.data;
};

// Get all documents with pagination
export const getAdminDocuments = async (
  page: number = 1,
  limit: number = 10,
  status?: string
) => {
  const params: Record<string, any> = { page, limit };
  if (status) params.status = status;
  
  const response = await apiClient.get('/api/admin/documents', { params });
  return response.data;
};

// Get audit logs with pagination
export const getAdminAuditLogs = async (
  page: number = 1,
  limit: number = 20,
  user_email?: string,
  action?: string
) => {
  const params: Record<string, any> = { page, limit };
  if (user_email) params.user_email = user_email;
  if (action) params.action = action;
  
  const response = await apiClient.get('/api/admin/audit-logs', { params });
  return response.data;
};

// Get all users
export const getAdminUsers = async () => {
  const response = await apiClient.get('/api/admin/users');
  return response.data;
};

// Delete a document
export const deleteAdminDocument = async (documentId: string): Promise<void> => {
  await apiClient.delete(`/api/admin/documents/${documentId}`);
};

// Reprocess a document
export const reprocessAdminDocument = async (documentId: string): Promise<void> => {
  await apiClient.post(`/api/admin/documents/${documentId}/reprocess`);
};

// Update document (type, notes, verified)
export const updateAdminDocument = async (
  documentId: string,
  data: AdminDocumentUpdate
): Promise<AdminDocument> => {
  const response = await apiClient.put(`/api/admin/documents/${documentId}`, data);
  return response.data;
};

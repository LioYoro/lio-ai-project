export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export interface Document {
  id: string;
  filename: string;
  file_type: string;
  status: "pending" | "processing" | "completed" | "failed";
  raw_text?: string;
  extracted_data?: Record<string, any>;
  confidence_score?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentList {
  id: string;
  filename: string;
  file_type: string;
  status: string;
  raw_text?: string;
  confidence_score?: number;
  created_at: string;
}

export interface Workflow {
  id: string;
  document_id: string;
  status: string;
  action?: string;
  notes?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: {
    id: string;
    email: string;
  };
}
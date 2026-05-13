export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export interface Document {
  id: string;
  filename: string;
  status: "pending" | "processing" | "completed" | "failed";
  raw_text?: string;
  extracted_data?: Record<string, any>;
  confidence_score?: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentList {
  id: string;
  filename: string;
  status: string;
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
}

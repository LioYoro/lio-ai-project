import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api";
import { Document, DocumentList } from "../types";

export const useDocuments = () => {
  const queryClient = useQueryClient();

  const listDocuments = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const response = await apiClient.get<DocumentList[]>("/api/documents/");
      return response.data;
    },
  });

  const getDocument = (documentId: string) =>
    useQuery({
      queryKey: ["documents", documentId],
      queryFn: async () => {
        const response = await apiClient.get<Document>(`/api/documents/${documentId}`);
        return response.data;
      },
      enabled: !!documentId,
    });

  const uploadDocument = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post<Document>("/api/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      await apiClient.delete(`/api/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  return { listDocuments, getDocument, uploadDocument, deleteDocument };
};

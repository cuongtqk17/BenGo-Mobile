import { useMutation } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/fetch";
import { Platform } from "react-native";

export interface UploadResponse {
  public_id: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export const useUpload = () => {
  const uploadMutation = useMutation({
    mutationFn: async (uri: string): Promise<UploadResponse> => {
      const formData = new FormData();

      const lastSlashIndex = uri.lastIndexOf("/");
      const filename = uri.substring(lastSlashIndex + 1) || `image_${Date.now()}.jpg`;
      const extension = filename.split(".").pop()?.toLowerCase();
      const type = extension ? `image/${extension === "jpg" ? "jpeg" : extension}` : "image/jpeg";

      console.log(`📤 [useUpload] Preparing FormData: ${filename} (${type})`);

      // @ts-ignore
      formData.append("file", {
        uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
        name: filename,
        type: type,
      });

      const response = await fetchAPI("/upload", {
        method: "POST",
        body: formData,
      });

      // The API returns { data: { data: { url: ... }, ... }, ... }
      if (response && response.data && response.data.data) {
        return response.data.data;
      }
      
      if (response && response.data) {
        return response.data;
      }
      return response;
    },
  });

  return {
    uploadImage: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error ? uploadMutation.error.message : null,
  };
};

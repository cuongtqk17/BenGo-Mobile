import { useMutation } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/fetch";

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

      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image`;

      // @ts-ignore
      formData.append("file", {
        uri,
        name: filename,
        type,
      });

      const response = await fetchAPI("/upload", {
        method: "POST",
        body: formData,
      });

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

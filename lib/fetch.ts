import { useAuthStore } from "@/store";
import { useQuery } from "@tanstack/react-query";

export const fetchAPI = async (url: string, options?: RequestInit) => {
    try {
        let finalUrl = url;
        const baseUrl = process.env.EXPO_PUBLIC_SERVER_URL || "https://bengo-backend.onrender.com/api/v1";
        const { token } = useAuthStore.getState();

        if (url.startsWith('/')) {
            // Remove /(api) if it exists, as the remote API likely doesn't have it
            if (url.startsWith('/(api)')) {
                finalUrl = `${baseUrl}${url.replace('/(api)', '')}`;
            } else {
                finalUrl = `${baseUrl}${url}`;
            }
        }

        const isFormData = options?.body instanceof FormData;

        const headers: Record<string, string> = {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options?.headers as Record<string, string>,
        };

        if (!isFormData && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(finalUrl, {
            ...options,
            headers,
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi HTTP! trạng thái: ${response.status} - ${errorText.substring(0, 200)}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const jsonData = await response.json();
            return jsonData;
        } else {
            const text = await response.text();
            try {
                const parsedData = JSON.parse(text);
                return parsedData;
            } catch (parseError) {
                throw new Error(`Phản hồi JSON không hợp lệ: ${text.substring(0, 100)}...`);
            }
        }
    } catch (error) {
        throw error;
    }
};



export const useFetch = <T>(url: string, options?: RequestInit) => {
    const { data, error, isLoading, refetch } = useQuery<T, Error>({
        queryKey: [url, options],
        queryFn: async () => {
            const result = await fetchAPI(url, options);
            // Handling the structure { data: T } which fetchAPI seems to return
            return result.data ?? result;
        },
    });

    return {
        data,
        loading: isLoading,
        error: error?.message || null,
        refetch
    };
};
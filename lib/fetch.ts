import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store";

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

        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options?.headers,
        };

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
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchAPI(url, options);
            setData(result.data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, [url, options]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {data, loading, error, refetch: fetchData};
};
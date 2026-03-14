import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/fetch";
import { User } from "@/types/type";

export const useProfile = () => {
    return useQuery<User>({
        queryKey: ["profile"],
        queryFn: async () => {
            const response = await fetchAPI("/(api)/auth/profile");
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.error || "Không thể lấy thông tin hồ sơ");
        },
        retry: 1,
    });
};

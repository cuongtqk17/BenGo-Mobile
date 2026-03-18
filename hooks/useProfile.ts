import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/fetch";
import { User } from "@/types/type";

export const useProfile = () => {
    return useQuery<User>({
        queryKey: ["profile"],
        queryFn: async () => {
            const response = await fetchAPI("/(api)/auth/profile");
            return response.data ?? response;
        },
        retry: 1,
    });
};

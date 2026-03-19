import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile, UpdateProfilePayload } from "@/api/profile";
import { User } from "@/types/type";

export const useProfile = () => {
    return useQuery<User>({
        queryKey: ["profile"],
        queryFn: getProfile,
        retry: 1,
    });
};

export { UpdateProfilePayload };

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
};

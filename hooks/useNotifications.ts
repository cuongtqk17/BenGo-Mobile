import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as NotificationApi from "@/api/notifications";

export const useNotifications = () => {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: NotificationApi.getNotifications,
        staleTime: 4000,
        refetchInterval: 4000,
    });
};

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: NotificationApi.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};

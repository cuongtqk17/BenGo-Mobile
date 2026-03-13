import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { driverService, PendingOrder, DriverStats, OrderDetail, OrderHistoryItem } from "@/lib/driver";

export const useDriverPendingOrders = (lat: number | null, lng: number | null, radius: number = 5) => {
  return useQuery<PendingOrder[]>({
    queryKey: ["driver-pending-orders", lat, lng, radius],
    queryFn: () => driverService.getPendingOrders(lat!, lng!, radius),
    enabled: !!lat && !!lng,
  });
};

export const useDriverStats = (from: string, to: string, enabled: boolean = true) => {
  return useQuery<DriverStats>({
    queryKey: ["driver-stats", from, to],
    queryFn: () => driverService.getStats(from, to),
    enabled: enabled && !!from && !!to,
  });
};

export const useDriverOrders = (params: { page?: number; limit?: number; status?: string; search?: string; time?: string }) => {
  return useQuery({
    queryKey: ["driver-orders", params],
    queryFn: () => driverService.getOrders(params),
  });
};

export const useOrderDetail = (id: string | null) => {
  return useQuery<OrderDetail>({
    queryKey: ["order-detail", id],
    queryFn: () => driverService.getOrderDetails(id!),
    enabled: !!id,
  });
};

// Mutations
export const useDriverToggleStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { isOnline: boolean; location: { lat: number; lng: number } }) =>
      driverService.toggleStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-profile"] }); // Assuming there might be a driver profile
    },
  });
};

export const useDriverAcceptOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => driverService.acceptOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-pending-orders"] });
      queryClient.invalidateQueries({ queryKey: ["driver-orders"] });
    },
  });
};

export const useDriverUpdateLocation = () => {
  return useMutation({
    mutationFn: (location: { lat: number; lng: number; heading?: number }) =>
      driverService.updateLocation(location),
  });
};

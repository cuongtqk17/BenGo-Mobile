import { useQuery } from "@tanstack/react-query";
import { customerService, NearbyDriver, UserProfile } from "@/lib/customer";

export const useNearbyDrivers = (lat: number | null, lng: number | null, radius: number = 5) => {
  return useQuery<NearbyDriver[]>({
    queryKey: ["nearby-drivers", lat, lng, radius],
    queryFn: () => customerService.getNearbyDrivers(lat!, lng!, radius),
    enabled: !!lat && !!lng,
  });
};

export const useCustomerProfile = (userId: string | null) => {
  return useQuery<UserProfile>({
    queryKey: ["customer-profile", userId],
    queryFn: () => customerService.getProfile(userId!),
    enabled: !!userId,
  });
};

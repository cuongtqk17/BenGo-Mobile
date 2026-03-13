import { fetchAPI } from "./fetch";

export interface NearbyDriver {
  id: string;
  vehicleType: string;
  location: { lat: number; lng: number };
  rating?: number;
}

export interface UserProfile {
  _id: string;
  phone: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  walletBalance: number;
  active: boolean;
  savedAddresses?: Array<{
    type: string;
    fullAddress: string;
    lat: number;
    lng: number;
  }>;
}

export const customerService = {
  getNearbyDrivers: async (lat: number, lng: number, radius: number = 5): Promise<NearbyDriver[]> => {
    const response = await fetchAPI(`/(api)/orders/drivers-nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    return response.data || [];
  },

  getProfile: async (userId: string): Promise<UserProfile> => {
    const response = await fetchAPI(`/(api)/auth/profile?user_id=${userId}`);
    return response.data;
  },
};

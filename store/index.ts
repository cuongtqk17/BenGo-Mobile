import { AuthStore, DriverStore, LocationStore, MarkerData, User } from '@/types/type';
import { create } from 'zustand';

export const useLocationStore = create<LocationStore>((set) => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    }));
  },

  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    }));
  },
}));

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [] as MarkerData[],
  selectedDriver: null,
  setSelectedDriver: (driverId: number) =>
    set(() => ({ selectedDriver: driverId })),
  setDrivers: (drivers: MarkerData[]) => set(() => ({ drivers: drivers })),
  clearSelectedDriver: () => set(() => ({ selectedDriver: null })),
}));

interface PromoInfo {
  id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  max_discount_amount?: number;
  min_order_amount?: number;
}

interface PromoStore {
  selectedPromo: PromoInfo | null;
  setSelectedPromo: (promo: PromoInfo | null) => void;
  clearSelectedPromo: () => void;
}

export const usePromoStore = create<PromoStore>((set) => ({
  selectedPromo: null,
  setSelectedPromo: (promo: PromoInfo | null) => set(() => ({ selectedPromo: promo })),
  clearSelectedPromo: () => set(() => ({ selectedPromo: null })),
}));

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  setAuth: (token: string, user: User) => set({ token, user }),
  logout: () => set({ token: null, user: null }),
}));
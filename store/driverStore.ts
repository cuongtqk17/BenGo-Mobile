import { create } from "zustand";

export const useDriverStore = create<DriverModeStore>((set) => ({
  // Driver info
  driverProfile: null,
  isDriver: false,

  // Driver status
  driverStatus: "offline",
  currentLocation: null,

  // Active ride
  activeRide: null,
  rideRequests: [],

  // Earnings
  todayEarnings: 0,
  weekEarnings: 0,
  monthEarnings: 0,

  // Actions
  setDriverProfile: (profile) =>
    set({
      driverProfile: profile,
      isDriver: !!profile,
      driverStatus: profile?.status || "offline",
    }),

  updateDriverStatus: (status) =>
    set((state) => ({
      driverStatus: status as any,
      driverProfile: state.driverProfile
        ? { ...state.driverProfile, status: status as any }
        : null,
    })),

  updateLocation: (location) =>
    set((state) => ({
      currentLocation: location,
      driverProfile: state.driverProfile
        ? {
            ...state.driverProfile,
            current_latitude: location.latitude,
            current_longitude: location.longitude,
          }
        : null,
    })),

  setActiveRide: (ride) => set({ activeRide: ride }),

  addRideRequest: (request) =>
    set((state) => ({
      rideRequests: [...state.rideRequests, request],
    })),

  removeRideRequest: (requestId) =>
    set((state) => ({
      rideRequests: state.rideRequests.filter((r) => r.ride_id !== requestId),
    })),

  updateEarnings: (earnings) =>
    set({
      todayEarnings: earnings.today,
      weekEarnings: earnings.week,
      monthEarnings: earnings.month,
    }),

  clearDriverData: () =>
    set({
      driverProfile: null,
      isDriver: false,
      driverStatus: "offline",
      currentLocation: null,
      activeRide: null,
      rideRequests: [],
      todayEarnings: 0,
      weekEarnings: 0,
      monthEarnings: 0,
    }),
}));

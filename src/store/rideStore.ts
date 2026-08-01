import { create } from 'zustand';

export interface LocationPoint {
  lat: number;
  lng: number;
  address: string;
}

export interface RideEstimate {
  distanceText: string;
  durationText: string;
  fare: number;
  encodedPolyline: string;
}

interface RideState {
  pickup: LocationPoint | null;
  dropoff: LocationPoint | null;
  estimate: RideEstimate | null;
  selectedVehicle: string | null;
  setPickup: (loc: LocationPoint) => void;
  setDropoff: (loc: LocationPoint) => void;
  setEstimate: (est: RideEstimate | null) => void;
  setSelectedVehicle: (vehicle: string) => void;
  clearRide: () => void;
}

export const useRideStore = create<RideState>((set) => ({
  pickup: null,
  dropoff: null,
  estimate: null,
  selectedVehicle: null,

  setPickup: (loc) => set({ pickup: loc, estimate: null }),
  setDropoff: (loc) => set({ dropoff: loc, estimate: null }),
  setEstimate: (est) => set({ estimate: est }),
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
  clearRide: () => set({ pickup: null, dropoff: null, estimate: null, selectedVehicle: null }),
}));

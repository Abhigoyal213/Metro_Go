import { create } from "zustand";

interface BookingState {
  source: string | null;
  destination: string | null;
  selectedRoute: any | null;
  route: any | null;
  bookingRef: string | null;
  setSource: (source: string) => void;
  setDestination: (destination: string) => void;
  setRoute: (selectedRoute: any) => void;
  setBookingRef: (bookingRef: string) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  source: null,
  destination: null,
  selectedRoute: null,
  route: null,
  bookingRef: null,
  setSource: (source) => set({ source }),
  setDestination: (destination) => set({ destination }),
  setRoute: (selectedRoute) => set({ selectedRoute, route: selectedRoute }),
  setBookingRef: (bookingRef) => set({ bookingRef }),
}));
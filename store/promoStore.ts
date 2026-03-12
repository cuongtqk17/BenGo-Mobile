import { create } from 'zustand';

export const usePromoStore = create<PromoStore>((set) => ({
  appliedPromo: null,
  availablePromos: [],
  isValidating: false,

  setAppliedPromo: (promo) => set({ appliedPromo: promo }),
  
  setAvailablePromos: (promos) => set({ availablePromos: promos }),
  
  setIsValidating: (isValidating) => set({ isValidating }),
  
  clearPromo: () => set({ appliedPromo: null }),
}));

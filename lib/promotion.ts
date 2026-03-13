import { fetchAPI } from "./fetch";

export interface Promotion {
  _id: string;
  code: string;
  title: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  image?: string;
  banner_url?: string;
}

export const promotionService = {
  getPromotions: async (): Promise<Promotion[]> => {
    const response = await fetchAPI("/(api)/admin/promotions");
    return response.data || [];
  },
};

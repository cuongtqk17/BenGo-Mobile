// Utility functions for ride pricing calculations

export interface PricingFactors {
  basePrice: number;
  timeInMinutes: number;
  distanceInMeters: number;
  serviceFeeRate: number;
  taxRate: number;
  surgeMultiplier?: number; // Hệ số tăng giá khi cao điểm
  vehicleType: string; // Loại phương tiện
  carSeats: number; // Số chỗ ngồi
}

export interface PricingResult {
  basePrice: number;
  timePrice: number;
  distancePrice: number;
  vehicleMultiplier: number;
  serviceFee: number;
  tax: number;
  surgePrice: number;
  totalPrice: number;
  breakdown: {
    base: number;
    time: number;
    distance: number;
    vehicle: number;
    service: number;
    tax: number;
    surge: number;
  };
}

// Tính hệ số giá theo loại phương tiện và số chỗ
export const getVehicleMultiplier = (vehicleType: string, carSeats: number): number => {
  // Hệ số cơ bản theo loại xe
  let vehicleMultiplier = 1;

  switch (vehicleType.toLowerCase()) {
    case 'motorbike':
    case 'bike':
    case 'xe máy':
      vehicleMultiplier = 0.6; // Xe máy rẻ hơn 40%
      break;
    case 'car':
    case 'ô tô':
      vehicleMultiplier = 1; // Xe hơi chuẩn
      break;
    case 'suv':
      vehicleMultiplier = 1.3; // SUV đắt hơn 30%
      break;
    case 'van':
    case 'minivan':
      vehicleMultiplier = 1.5; // Van đắt hơn 50%
      break;
    case 'luxury':
    case 'sang trọng':
      vehicleMultiplier = 2; // Xe sang đắt gấp đôi
      break;
    default:
      vehicleMultiplier = 1;
  }

  // Điều chỉnh theo số chỗ ngồi
  if (carSeats >= 7) {
    vehicleMultiplier *= 1.2; // +20% cho xe 7+ chỗ
  } else if (carSeats >= 5) {
    vehicleMultiplier *= 1.1; // +10% cho xe 5-6 chỗ
  }
  // Xe 4 chỗ trở xuống giữ nguyên

  return vehicleMultiplier;
};

// Tính giá chuyến dựa trên các yếu tố
export const calculateRidePrice = (factors: PricingFactors): PricingResult => {
  const {
    basePrice = 15000,
    timeInMinutes,
    distanceInMeters,
    serviceFeeRate = 0.1,
    taxRate = 0.1,
    surgeMultiplier = 1,
    vehicleType,
    carSeats
  } = factors;

  // Tính hệ số theo loại xe và số chỗ
  const vehicleMultiplier = getVehicleMultiplier(vehicleType, carSeats);

  // Áp dụng hệ số xe vào giá cơ bản
  const adjustedBasePrice = basePrice * vehicleMultiplier;

  // Tính giá theo thời gian (500 VND/phút * hệ số xe)
  const timePrice = timeInMinutes * 500 * vehicleMultiplier;

  // Tính giá theo khoảng cách (20 VND/mét * hệ số xe)
  const distancePrice = distanceInMeters * 0.02 * vehicleMultiplier;

  // Phí dịch vụ
  const serviceFee = adjustedBasePrice * serviceFeeRate;

  // Thuế
  const subtotal = adjustedBasePrice + timePrice + distancePrice + serviceFee;
  const tax = subtotal * taxRate;

  // Giá trước surge
  const priceBeforeSurge = subtotal + tax;

  // Áp dụng surge pricing
  const surgePrice = priceBeforeSurge * (surgeMultiplier - 1);
  const totalPrice = priceBeforeSurge * surgeMultiplier;

  return {
    basePrice: adjustedBasePrice,
    timePrice,
    distancePrice,
    vehicleMultiplier,
    serviceFee,
    tax,
    surgePrice,
    totalPrice: Math.round(totalPrice),
    breakdown: {
      base: adjustedBasePrice,
      time: timePrice,
      distance: distancePrice,
      vehicle: adjustedBasePrice - basePrice, // Phần chênh lệch do loại xe
      service: serviceFee,
      tax: tax,
      surge: surgePrice
    }
  };
};

// Tính surge multiplier dựa trên thời gian và vị trí
export const calculateSurgeMultiplier = (
  currentTime: Date,
  isHighDemandArea: boolean = false
): number => {
  const hour = currentTime.getHours();

  // Giờ cao điểm: 7-9h sáng, 17-19h chiều
  const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);

  // Cuối tuần
  const isWeekend = currentTime.getDay() === 0 || currentTime.getDay() === 6;

  let multiplier = 1;

  if (isRushHour) {
    multiplier += 0.3; // +30% trong giờ cao điểm
  }

  if (isWeekend) {
    multiplier += 0.2; // +20% cuối tuần
  }

  if (isHighDemandArea) {
    multiplier += 0.4; // +40% khu vực có nhu cầu cao
  }

  // Giới hạn surge tối đa 2.5x
  return Math.min(multiplier, 2.5);
};

// Tính giá tối thiểu và tối đa cho một chuyến đi
export const getPriceRange = (
  timeInMinutes: number,
  distanceInMeters: number,
  vehicleType: string = 'car',
  carSeats: number = 4
): { min: number; max: number } => {
  const minFactors: PricingFactors = {
    basePrice: 15000,
    timeInMinutes,
    distanceInMeters,
    serviceFeeRate: 0.1,
    taxRate: 0.1,
    surgeMultiplier: 1,
    vehicleType,
    carSeats
  };

  const maxFactors: PricingFactors = {
    basePrice: 15000,
    timeInMinutes,
    distanceInMeters,
    serviceFeeRate: 0.1,
    taxRate: 0.1,
    surgeMultiplier: 2.5,
    vehicleType,
    carSeats
  };

  const minPrice = calculateRidePrice(minFactors).totalPrice;
  const maxPrice = calculateRidePrice(maxFactors).totalPrice;

  return { min: minPrice, max: maxPrice };
};

// Format giá tiền theo định dạng VND
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

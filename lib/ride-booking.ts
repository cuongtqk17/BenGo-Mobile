import { fetchAPI } from "./fetch";

export interface BookingData {
  origin_address: string;
  destination_address: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  ride_time: number;
  fare_price: number;
  driver_id: number;
  user_id: string;
  payment_intent_id: string;
}

export const bookRideAfterPayment = async (bookingData: BookingData) => {
  try {
    const response = await fetchAPI("/(api)/ride/book", {
      method: "POST",
      body: JSON.stringify(bookingData)
    });

    if (response.success) {
      return {
        success: true,
        ride: response.data,
        message: response.message
      };
    } else {
      throw new Error(response.error || "Lỗi khi đặt chuyến");
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi không xác định"
    };
  }
};

export const cancelRide = async (rideId: number, userId: string, reason?: string) => {
  try {
    const response = await fetchAPI("/(api)/ride/cancel", {
      method: "PUT",
      body: JSON.stringify({
        ride_id: rideId,
        user_id: userId,
        reason: reason || "Người dùng đã hủy"
      })
    });

    if (response.success) {
      return {
        success: true,
        ride: response.data,
        message: response.message
      };
    } else {
      throw new Error(response.error || "Lỗi khi hủy chuyến");
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi không xác định"
    };
  }
};


export const canCancelRide = (ride: any): { canCancel: boolean; reason?: string } => {
  // Kiểm tra trạng thái thanh toán
  if (ride.payment_status === 'cancelled') {
    return { canCancel: false, reason: "Chuyến đã được hủy trước đó" };
  }

  // Kiểm tra trạng thái chuyến đi
  if (ride.ride_status === 'cancelled' || ride.ride_status === 'completed') {
    return { canCancel: false, reason: "Không thể hủy chuyến đã hoàn thành hoặc đã hủy" };
  }

  if (ride.ride_status === 'in_progress') {
    return { canCancel: false, reason: "Không thể hủy chuyến đang diễn ra" };
  }

  return { canCancel: true };
};

export const getUserRides = async (
  userId: string, 
  status: 'all' | 'active' | 'completed' | 'cancelled' = 'all',
  limit: number = 50,
  offset: number = 0
) => {
  try {
    const response = await fetchAPI(
      `/(api)/ride/list?user_id=${userId}&status=${status}&limit=${limit}&offset=${offset}`
    );

    if (response.success) {
      return {
        success: true,
        rides: response.data,
        pagination: response.pagination
      };
    } else {
      throw new Error(response.error || "Lỗi khi lấy danh sách chuyến đi");
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi không xác định"
    };
  }
};

import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL chưa được thiết lập");
}

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const body = await request.json();
    const { code, user_id, ride_amount } = body;

    if (!code || !user_id || !ride_amount) {
      return Response.json(
        { 
          success: false,
          error: "Thiếu thông tin bắt buộc",
          reason: "missing_fields"
        },
        { status: 400 }
      );
    }

    // 1. Tìm promo code
    const promoResult = await sql`
      SELECT * FROM promo_codes
      WHERE UPPER(code) = UPPER(${code})
    `;

    if (promoResult.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Mã giảm giá không tồn tại",
          reason: "not_found"
        },
        { status: 404 }
      );
    }

    const promo = promoResult[0];

    // 2. Kiểm tra is_active
    if (!promo.is_active) {
      return Response.json(
        {
          success: false,
          error: "Mã giảm giá không còn hiệu lực",
          reason: "inactive"
        },
        { status: 400 }
      );
    }

    // 3. Kiểm tra thời gian
    const now = new Date();
    const validFrom = new Date(promo.valid_from);
    const validUntil = promo.valid_until ? new Date(promo.valid_until) : null;

    if (now < validFrom) {
      return Response.json(
        {
          success: false,
          error: "Mã giảm giá chưa có hiệu lực",
          reason: "not_started"
        },
        { status: 400 }
      );
    }

    if (validUntil && now > validUntil) {
      return Response.json(
        {
          success: false,
          error: "Mã giảm giá đã hết hạn",
          reason: "expired"
        },
        { status: 400 }
      );
    }

    // 4. Kiểm tra số lần sử dụng tổng
    if (promo.max_uses && promo.current_uses >= promo.max_uses) {
      return Response.json(
        {
          success: false,
          error: "Mã giảm giá đã hết lượt sử dụng",
          reason: "max_uses_reached"
        },
        { status: 400 }
      );
    }

    // 6. Kiểm tra giá trị đơn hàng tối thiểu
    if (ride_amount < promo.min_ride_amount) {
      return Response.json(
        {
          success: false,
          error: `Giá trị chuyến đi tối thiểu ${promo.min_ride_amount.toLocaleString('vi-VN')} VNĐ`,
          reason: "min_amount_not_met"
        },
        { status: 400 }
      );
    }

    // 7. Kiểm tra user_type restrictions
    if (promo.user_type === 'new_users') {
      // Check if user has any completed rides
      const userRidesResult = await sql`
        SELECT COUNT(*) as ride_count
        FROM rides
        WHERE user_id = ${user_id}
        AND ride_status = 'completed'
      `;

      const rideCount = parseInt(userRidesResult[0].ride_count);

      if (rideCount > 0) {
        return Response.json(
          {
            success: false,
            error: "Mã này chỉ dành cho người dùng mới",
            reason: "not_new_user"
          },
          { status: 400 }
        );
      }
    }

    // 8. Tính toán discount
    let discountAmount = 0;

    if (promo.discount_type === 'percentage') {
      discountAmount = (ride_amount * promo.discount_value) / 100;
      
      // Apply max discount limit
      if (promo.max_discount_amount && discountAmount > promo.max_discount_amount) {
        discountAmount = promo.max_discount_amount;
      }
    } else if (promo.discount_type === 'fixed_amount') {
      discountAmount = promo.discount_value;
    } else if (promo.discount_type === 'free_ride') {
      discountAmount = ride_amount;
    }

    // Ensure discount doesn't exceed ride amount
    if (discountAmount > ride_amount) {
      discountAmount = ride_amount;
    }

    const finalAmount = ride_amount - discountAmount;

    // 9. Return success response
    return Response.json(
      {
        success: true,
        data: {
          promo_code_id: promo.id,
          code: promo.code,
          discount_type: promo.discount_type,
          discount_value: promo.discount_value,
          original_amount: ride_amount,
          discount_amount: discountAmount,
          final_amount: finalAmount,
          message: "Mã giảm giá hợp lệ"
        }
      },
      { status: 200 }
    );

  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Lỗi máy chủ nội bộ",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

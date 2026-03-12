import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const body = await request.json();

    const { code, user_id, ride_id, original_amount } = body;

    // Validate required fields
    if (!code || !user_id || !ride_id || !original_amount) {
      return Response.json(
        {
          success: false,
          error: "Thiếu thông tin bắt buộc",
        },
        { status: 400 }
      );
    }

    // 1. Validate promo code (reuse validation logic)
    const validateResponse = await fetch(
      `${request.url.replace("/apply", "/validate")}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          user_id,
          ride_amount: original_amount,
        }),
      }
    );

    const validateData = await validateResponse.json();

    if (!validateData.success) {
      return Response.json(validateData, { status: validateResponse.status });
    }

    const promoData = validateData.data;

    // 2. Begin transaction
    try {
      // Insert into promo_code_usage
      const usageResult = await sql`
        INSERT INTO promo_code_usage (
          promo_code_id,
          user_id,
          ride_id,
          original_amount,
          discount_amount,
          final_amount,
          used_at
        ) VALUES (
          ${promoData.promo_code_id},
          ${user_id},
          ${ride_id},
          ${original_amount},
          ${promoData.discount_amount},
          ${promoData.final_amount},
          NOW()
        )
        RETURNING id
      `;

      // Update current_uses in promo_codes
      await sql`
        UPDATE promo_codes 
        SET 
          current_uses = current_uses + 1,
          updated_at = NOW()
        WHERE id = ${promoData.promo_code_id}
      `;

      // Update rides table with promo info
      await sql`
        UPDATE rides 
        SET 
          promo_code_id = ${promoData.promo_code_id},
          original_fare_price = ${original_amount},
          discount_amount = ${promoData.discount_amount},
          fare_price = ${promoData.final_amount}
        WHERE ride_id = ${ride_id}
      `;

      return Response.json(
        {
          success: true,
          data: {
            promo_code_id: promoData.promo_code_id,
            code: promoData.code,
            discount_amount: promoData.discount_amount,
            final_amount: promoData.final_amount,
            usage_id: usageResult[0].id,
          },
          message: `Đã áp dụng mã ${code}`,
        },
        { status: 200 }
      );
    } catch (dbError: any) {
      return Response.json(
        {
          success: false,
          error: "Lỗi khi áp dụng mã giảm giá",
          details: dbError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: "Lỗi khi áp dụng mã giảm giá",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

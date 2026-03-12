import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return Response.json(
        {
          success: false,
          error: "Thiếu user_id",
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Get all active promo codes
    const promos = await sql`
      SELECT 
        pc.id,
        pc.code,
        pc.description,
        pc.discount_type,
        pc.discount_value,
        pc.max_discount_amount,
        pc.min_ride_amount,
        pc.max_uses,
        pc.max_uses_per_user,
        pc.current_uses,
        pc.valid_from,
        pc.valid_until,
        pc.user_type,
        COALESCE(
          (SELECT COUNT(*) 
           FROM promo_code_usage 
           WHERE promo_code_id = pc.id AND user_id = ${userId}),
          0
        ) as times_used
      FROM promo_codes pc
      WHERE pc.is_active = true
        AND pc.valid_from <= ${now}
        AND (pc.valid_until IS NULL OR pc.valid_until >= ${now})
        AND (pc.max_uses IS NULL OR pc.current_uses < pc.max_uses)
      ORDER BY pc.created_at DESC
    `;

    // Filter promos based on user eligibility
    const eligiblePromos = [];

    for (const promo of promos) {
      // Check if user has reached usage limit
      if (promo.times_used >= promo.max_uses_per_user) {
        continue;
      }

      // Check user_type restriction
      if (promo.user_type === "new_users") {
        // Check if user has completed rides
        const userRides = await sql`
          SELECT COUNT(*) as ride_count
          FROM rides
          WHERE user_id = ${userId}
            AND ride_status = 'completed'
        `;

        if (parseInt(userRides[0].ride_count) > 0) {
          continue; // Skip this promo for existing users
        }
      } else if (promo.user_type === "existing_users") {
        // Check if user has completed rides
        const userRides = await sql`
          SELECT COUNT(*) as ride_count
          FROM rides
          WHERE user_id = ${userId}
            AND ride_status = 'completed'
        `;

        if (parseInt(userRides[0].ride_count) === 0) {
          continue; // Skip this promo for new users
        }
      }

      // Check specific_users restriction
      if (promo.specific_users && promo.specific_users.length > 0) {
        if (!promo.specific_users.includes(userId)) {
          continue;
        }
      }

      eligiblePromos.push({
        id: promo.id,
        code: promo.code,
        description: promo.description,
        discount_type: promo.discount_type,
        discount_value: parseFloat(promo.discount_value),
        max_discount_amount: promo.max_discount_amount
          ? parseFloat(promo.max_discount_amount)
          : null,
        min_ride_amount: parseFloat(promo.min_ride_amount || 0),
        valid_until: promo.valid_until,
        times_used: parseInt(promo.times_used),
        max_uses_per_user: promo.max_uses_per_user,
        remaining_uses: promo.max_uses_per_user - parseInt(promo.times_used),
      });
    }

    return Response.json(
      {
        success: true,
        data: eligiblePromos,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: "Lỗi khi lấy danh sách mã giảm giá",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

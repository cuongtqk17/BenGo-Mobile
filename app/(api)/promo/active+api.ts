import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const now = new Date().toISOString();

    // Lấy tất cả mã giảm giá đang hoạt động và còn hạn
    const promoCodes = await sql`
      SELECT 
        id,
        code,
        description,
        discount_type,
        discount_value,
        max_discount_amount,
        min_order_amount,
        usage_limit,
        used_count,
        start_date,
        end_date,
        is_active,
        created_at,
        updated_at
      FROM promo_codes
      WHERE is_active = true
        AND start_date <= ${now}
        AND (end_date IS NULL OR end_date >= ${now})
        AND (usage_limit IS NULL OR used_count < usage_limit)
      ORDER BY created_at DESC
    `;

    return Response.json(
      {
        success: true,
        data: promoCodes,
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

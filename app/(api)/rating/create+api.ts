import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL chưa được thiết lập");
}

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { ride_id, user_id, driver_id, stars, comment } = await request.json();

    // Validate input
    if (!ride_id || !user_id || !driver_id || !stars) {
      return Response.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    if (stars < 1 || stars > 5) {
      return Response.json(
        { error: "Số sao phải từ 1 đến 5" },
        { status: 400 }
      );
    }

    // Kiểm tra ride có tồn tại và thuộc về user không
    const rideCheck = await sql`
      SELECT ride_id, user_id, ride_status 
      FROM rides 
      WHERE ride_id = ${ride_id} AND user_id = ${user_id}
    `;

    if (rideCheck.length === 0) {
      return Response.json(
        { error: "Không tìm thấy chuyến đi hoặc bạn không có quyền đánh giá" },
        { status: 404 }
      );
    }

    // Kiểm tra chuyến đi đã hoàn thành chưa
    if (rideCheck[0].ride_status !== 'completed') {
      return Response.json(
        { error: "Chỉ có thể đánh giá chuyến đi đã hoàn thành" },
        { status: 400 }
      );
    }

    // Kiểm tra đã đánh giá chưa
    const existingRating = await sql`
      SELECT id FROM ratings WHERE ride_id = ${ride_id}
    `;

    if (existingRating.length > 0) {
      return Response.json(
        { error: "Chuyến đi này đã được đánh giá" },
        { status: 409 }
      );
    }

    // Tạo rating mới
    const result = await sql`
      INSERT INTO ratings (ride_id, user_id, driver_id, stars, comment)
      VALUES (${ride_id}, ${user_id}, ${driver_id}, ${stars}, ${comment || null})
      RETURNING *
    `;

    return Response.json(
      {
        success: true,
        data: result[0],
        message: "Đánh giá thành công",
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      {
        error: "Lỗi máy chủ nội bộ",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { searchParams } = new URL(request.url);
    const ride_id = searchParams.get("ride_id");

    if (!ride_id) {
      return Response.json(
        { error: "Thiếu ride_id" },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT * FROM ratings WHERE ride_id = ${ride_id}
    `;

    if (result.length === 0) {
      return Response.json(
        { data: null, message: "Chuyến đi chưa được đánh giá" },
        { status: 200 }
      );
    }

    return Response.json(
      { success: true, data: result[0] },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        error: "Lỗi máy chủ nội bộ",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

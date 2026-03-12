import { getVietnamTimeAsUTC } from "@/lib/utils";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("Biến môi trường DATABASE_URL chưa được thiết lập");
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { ride_id, user_id, reason } = body;

    if (!ride_id || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    const existingRide = await sql`
      SELECT * FROM rides 
      WHERE ride_id = ${ride_id} AND user_id = ${user_id}
    `;

    if (existingRide.length === 0) {
      return new Response(
        JSON.stringify({ error: "Chuyến không tồn tại hoặc không thuộc về bạn" }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // Kiểm tra trạng thái chuyến đi
    const ride = existingRide[0];
    
    
    if (ride.payment_status === 'cancelled') {
      return new Response(
        JSON.stringify({ error: "Chuyến đã được hủy trước đó" }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // Kiểm tra trạng thái ride_status
    if (ride.ride_status === 'cancelled') {
      return new Response(
        JSON.stringify({ error: "Chuyến đã được hủy trước đó" }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    if (ride.ride_status === 'completed') {
      return new Response(
        JSON.stringify({ error: "Không thể hủy chuyến đã hoàn thành" }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    if (ride.ride_status === 'in_progress') {
      return new Response(
        JSON.stringify({ error: "Không thể hủy chuyến đang diễn ra" }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }



    const response = await sql`
      UPDATE rides 
      SET 
        payment_status = 'cancelled',
        ride_status = 'cancelled',
        cancelled_at = ${getVietnamTimeAsUTC()},
        cancel_reason = ${reason || 'Người dùng đã hủy'}
      WHERE ride_id = ${ride_id} AND user_id = ${user_id}
      RETURNING *;
    `;

    return new Response(
      JSON.stringify({
        success: true,
        data: response[0],
        message: "Chuyến đã được hủy thành công"
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Lỗi máy chủ nội bộ",
        details: error instanceof Error ? error.message : "Lỗi không xác định"
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

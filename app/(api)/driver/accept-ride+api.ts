import { neon } from "@neondatabase/serverless";

// POST: Driver nhận chuyến
export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const body = await request.json();

    const { ride_id, driver_id } = body;

    if (!ride_id || !driver_id) {
      return Response.json(
        {
          success: false,
          error: "Thiếu ride_id hoặc driver_id",
        },
        { status: 400 }
      );
    }

    // Kiểm tra chuyến có tồn tại và chưa có driver
    const ride = await sql`
      SELECT * FROM rides 
      WHERE ride_id = ${ride_id}
      LIMIT 1
    `;

    if (ride.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Không tìm thấy chuyến đi",
        },
        { status: 404 }
      );
    }

    if (ride[0].driver_id && ride[0].driver_id !== 0) {
      return Response.json(
        {
          success: false,
          error: "Chuyến đã có tài xế nhận",
        },
        { status: 409 }
      );
    }

    // Kiểm tra driver có tồn tại và đã được duyệt
    const driver = await sql`
      SELECT * FROM drivers 
      WHERE id = ${driver_id}
      LIMIT 1
    `;

    if (driver.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Không tìm thấy tài xế",
        },
        { status: 404 }
      );
    }

    if (driver[0].approval_status !== "approved") {
      return Response.json(
        {
          success: false,
          error: "Tài xế chưa được duyệt",
        },
        { status: 403 }
      );
    }

    // Cập nhật chuyến: gán driver và đổi status thành confirmed
    const result = await sql`
      UPDATE rides 
      SET 
        driver_id = ${driver_id},
        ride_status = 'confirmed'
      WHERE ride_id = ${ride_id}
      RETURNING *
    `;

    // Log event
    await sql`
      INSERT INTO ride_status_events (
        ride_id,
        old_status,
        new_status,
        changed_by,
        changed_by_id,
        event_type,
        created_at
      ) VALUES (
        ${ride_id},
        ${ride[0].ride_status || 'pending'},
        'confirmed',
        'driver',
        ${driver_id},
        'status_change',
        NOW()
      )
    `;

    // Cập nhật số chuyến của driver
    await sql`
      UPDATE drivers 
      SET 
        total_rides = total_rides + 1,
        status = 'on_ride'
      WHERE id = ${driver_id}
    `;

    return Response.json(
      {
        success: true,
        data: {
          ride: result[0],
        },
        message: "Nhận chuyến thành công",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: "Lỗi khi nhận chuyến",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

import { neon } from "@neondatabase/serverless";

export async function PATCH(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const body = await request.json();

    const { driver_id, latitude, longitude } = body;

    // Validate required fields
    if (!driver_id || latitude === undefined || longitude === undefined) {
      return Response.json(
        {
          success: false,
          error: "Thiếu thông tin bắt buộc",
        },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return Response.json(
        {
          success: false,
          error: "Tọa độ không hợp lệ",
        },
        { status: 400 }
      );
    }

    // Check if driver exists
    const driver = await sql`
      SELECT id FROM drivers WHERE id = ${driver_id} LIMIT 1
    `;

    if (driver.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Tài xế không tồn tại",
        },
        { status: 404 }
      );
    }

    // Update driver location
    await sql`
      UPDATE drivers 
      SET 
        current_latitude = ${latitude},
        current_longitude = ${longitude},
        last_location_update = NOW(),
        updated_at = NOW()
      WHERE id = ${driver_id}
    `;

    return Response.json(
      {
        success: true,
        data: {
          driver_id: driver_id,
          latitude: latitude,
          longitude: longitude,
          last_location_update: new Date().toISOString(),
        },
        message: "Đã cập nhật vị trí",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: "Lỗi khi cập nhật vị trí",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

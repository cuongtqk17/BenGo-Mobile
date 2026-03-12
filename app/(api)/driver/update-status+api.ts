import { neon } from "@neondatabase/serverless";

export async function PATCH(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const body = await request.json();

    const { driver_id, new_status, latitude, longitude } = body;

    // Validate required fields
    if (!driver_id || !new_status) {
      return Response.json(
        {
          success: false,
          error: "Thiếu thông tin bắt buộc",
        },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["online", "offline", "on_ride", "picking_up"];
    if (!validStatuses.includes(new_status)) {
      return Response.json(
        {
          success: false,
          error: "Trạng thái không hợp lệ",
        },
        { status: 400 }
      );
    }

    // Get current driver status
    const driver = await sql`
      SELECT id, status, approval_status FROM drivers 
      WHERE id = ${driver_id} 
      LIMIT 1
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

    // Check if driver is approved
    if (driver[0].approval_status !== "approved") {
      return Response.json(
        {
          success: false,
          error: "Tài xế chưa được phê duyệt",
        },
        { status: 403 }
      );
    }

    const oldStatus = driver[0].status;

    // Update driver status
    const updateFields: any = {
      status: new_status,
      updated_at: new Date().toISOString(),
    };

    // Update location if provided
    if (latitude !== undefined && longitude !== undefined) {
      updateFields.current_latitude = latitude;
      updateFields.current_longitude = longitude;
      updateFields.last_location_update = new Date().toISOString();
    }

    await sql`
      UPDATE drivers 
      SET 
        status = ${new_status},
        current_latitude = ${latitude || driver[0].current_latitude},
        current_longitude = ${longitude || driver[0].current_longitude},
        last_location_update = ${
          latitude !== undefined ? new Date().toISOString() : driver[0].last_location_update
        },
        updated_at = NOW()
      WHERE id = ${driver_id}
    `;

    try {
      await sql`
        INSERT INTO driver_status_history (
          driver_id,
          old_status,
          new_status,
          latitude,
          longitude,
          changed_at
        ) VALUES (
          ${driver_id},
          ${oldStatus},
          ${new_status},
          ${latitude || null},
          ${longitude || null},
          NOW()
        )
      `;
    } catch (historyError) {
      console.warn("Failed to log driver status history:", historyError);
    }

    return Response.json(
      {
        success: true,
        data: {
          driver_id: driver_id,
          old_status: oldStatus,
          new_status: new_status,
          updated_at: new Date().toISOString(),
        },
        message: `Đã cập nhật trạng thái thành ${new_status}`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: "Lỗi khi cập nhật trạng thái",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

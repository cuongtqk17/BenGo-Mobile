import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const body = await request.json();

    const { user_id, driver_id, expo_push_token, device_type } = body;

    // Validate required fields
    if (!expo_push_token || !device_type) {
      return Response.json(
        {
          success: false,
          error: "Thiếu thông tin bắt buộc",
        },
        { status: 400 }
      );
    }

    // Must have either user_id or driver_id
    if (!user_id && !driver_id) {
      return Response.json(
        {
          success: false,
          error: "Phải có user_id hoặc driver_id",
        },
        { status: 400 }
      );
    }

    // Cannot have both
    if (user_id && driver_id) {
      return Response.json(
        {
          success: false,
          error: "Không thể có cả user_id và driver_id",
        },
        { status: 400 }
      );
    }

    // Check if token already exists
    const existingToken = user_id
      ? await sql`
          SELECT id FROM push_tokens 
          WHERE user_id = ${user_id}
          LIMIT 1
        `
      : await sql`
          SELECT id FROM push_tokens 
          WHERE driver_id = ${driver_id}
          LIMIT 1
        `;

    if (existingToken.length > 0) {
      // Update existing token
      if (user_id) {
        await sql`
          UPDATE push_tokens 
          SET 
            expo_push_token = ${expo_push_token},
            device_type = ${device_type},
            updated_at = NOW()
          WHERE user_id = ${user_id}
        `;
      } else {
        await sql`
          UPDATE push_tokens 
          SET 
            expo_push_token = ${expo_push_token},
            device_type = ${device_type},
            updated_at = NOW()
          WHERE driver_id = ${driver_id}
        `;
      }

      return Response.json(
        {
          success: true,
          message: "Đã cập nhật push token",
        },
        { status: 200 }
      );
    } else {
      // Insert new token
      await sql`
        INSERT INTO push_tokens (
          user_id,
          driver_id,
          expo_push_token,
          device_type,
          created_at,
          updated_at
        ) VALUES (
          ${user_id || null},
          ${driver_id || null},
          ${expo_push_token},
          ${device_type},
          NOW(),
          NOW()
        )
      `;

      return Response.json(
        {
          success: true,
          message: "Đã đăng ký push token",
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: "Lỗi khi đăng ký push token",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

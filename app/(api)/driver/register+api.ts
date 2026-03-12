import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const body = await request.json();
    const {
      clerk_id,
      email,
      first_name,
      last_name,
      phone,
      license_number,
      vehicle_type,
      car_seats,
    } = body;

    // Validate required fields
    const missingFields = [];
    if (!clerk_id) missingFields.push("clerk_id");
    if (!email) missingFields.push("email");
    if (!first_name) missingFields.push("first_name");
    // last_name can be empty
    if (!phone) missingFields.push("phone");
    if (!license_number) missingFields.push("license_number");
    if (!vehicle_type) missingFields.push("vehicle_type");
    if (!car_seats && car_seats !== 0) missingFields.push("car_seats");

    if (missingFields.length > 0) {
      return Response.json(
        {
          success: false,
          error: "Thiếu thông tin bắt buộc",
          missingFields,
        },
        { status: 400 }
      );
    }

    // Check if driver already exists
    const existingDriver = await sql`
      SELECT id, approval_status, license_image_url, car_image_url, profile_image_url 
      FROM drivers 
      WHERE clerk_id = ${clerk_id} OR email = ${email}
      LIMIT 1
    `;

    if (existingDriver.length > 0) {
      const updateResult = await sql`
        UPDATE drivers SET
          first_name = ${first_name},
          last_name = ${last_name},
          phone = ${phone},
          license_number = ${license_number},
          vehicle_type = ${vehicle_type},
          car_seats = ${car_seats},
          license_image_url = ${body.license_image_url || existingDriver[0].license_image_url},
          car_image_url = ${body.car_image_url || existingDriver[0].car_image_url},
          profile_image_url = ${body.profile_image_url || existingDriver[0].profile_image_url},
          approval_status = 'pending',
          updated_at = NOW()
        WHERE id = ${existingDriver[0].id}
        RETURNING id, approval_status
      `;

      return Response.json(
        {
          success: true,
          data: {
            driver_id: updateResult[0].id,
            approval_status: updateResult[0].approval_status,
          },
          message: "Cập nhật hồ sơ tài xế thành công. Đang chờ phê duyệt.",
        },
        { status: 200 }
      );
    }

    // Insert new driver
    const result = await sql`
      INSERT INTO drivers (
        clerk_id,
        email,
        first_name,
        last_name,
        phone,
        license_number,
        vehicle_type,
        car_seats,
        license_image_url,
        car_image_url,
        profile_image_url,
        approval_status,
        status,
        rating,
        average_rating,
        created_at,
        updated_at
      ) VALUES (
        ${clerk_id},
        ${email},
        ${first_name},
        ${last_name},
        ${phone},
        ${license_number},
        ${vehicle_type},
        ${car_seats},
        ${body.license_image_url || null},
        ${body.car_image_url || null},
        ${body.profile_image_url || null},
        'pending',
        'offline',
        5.0,
        5.0,
        NOW(),
        NOW()
      )
      RETURNING id, approval_status
    `;

    return Response.json(
      {
        success: true,
        data: {
          driver_id: result[0].id,
          approval_status: result[0].approval_status,
        },
        message: "Đăng ký tài xế thành công. Vui lòng upload giấy tờ.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: "Lỗi khi đăng ký tài xế",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

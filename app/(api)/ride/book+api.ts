import { getVietnamTimeAsUTC, formatDateVN, formatDateTimeVN } from "@/lib/utils";
import { neon } from "@neondatabase/serverless";
import { sendRideConfirmationEmail } from "@/lib/email";

if (!process.env.DATABASE_URL) {
  throw new Error("Biến môi trường DATABASE_URL chưa được thiết lập");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      origin_address,
      destination_address,
      origin_latitude,
      origin_longitude,
      destination_latitude,
      destination_longitude,
      ride_time,
      fare_price,
      driver_id,
      user_id,
      payment_intent_id,
      user_name,
      user_email,
    } = body;
    if (
      !origin_address ||
      !destination_address ||
      !origin_latitude ||
      !origin_longitude ||
      !destination_latitude ||
      !destination_longitude ||
      !ride_time ||
      !fare_price ||
      !driver_id ||
      !user_id ||
      !payment_intent_id
    ) {
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

    await sql`
      INSERT INTO users (clerk_id, name, email)
      VALUES (
        ${user_id}, 
        ${user_name || ''}, 
        ${user_email || ''}
      )
      ON CONFLICT (clerk_id) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        email = EXCLUDED.email
    `;

    // Sử dụng thời gian Việt Nam (GMT+7) cho created_at
    const vietnamTime = getVietnamTimeAsUTC();

    // Tạo chuyến với trạng thái "confirmed"
    const response = await sql`
      INSERT INTO rides ( 
          origin_address, 
          destination_address, 
          origin_latitude, 
          origin_longitude, 
          destination_latitude, 
          destination_longitude, 
          ride_time, 
          fare_price, 
          payment_status,
          ride_status,
          driver_id, 
          user_id,
          payment_intent_id,
          created_at
      ) VALUES (
          ${origin_address},
          ${destination_address},
          ${origin_latitude},
          ${origin_longitude},
          ${destination_latitude},
          ${destination_longitude},
          ${ride_time},
          ${fare_price},
          'paid',
          'pending',
          ${driver_id},
          ${user_id},
          ${payment_intent_id},
          ${vietnamTime}
      )
      RETURNING *;
    `;
    
    try {
      // Lấy thông tin user
      const userData = await sql`
        SELECT name, email FROM users WHERE clerk_id = ${user_id}
      `;
      
      // Lấy thông tin driver
      const driverData = await sql`
        SELECT first_name, last_name, vehicle_type 
        FROM drivers WHERE id = ${driver_id}
      `;
      
      if (userData.length > 0 && driverData.length > 0) {
        const user = userData[0];
        const driver = driverData[0];
        
        // Gửi email bất đồng bộ
        sendRideConfirmationEmail({
          userEmail: user.email,
          userName: user.name,
          rideId: response[0].ride_id,
          originAddress: origin_address,
          destinationAddress: destination_address,
          farePrice: parseFloat(fare_price),
          rideTime: formatDateTimeVN(vietnamTime),
          driverName: `${driver.first_name} ${driver.last_name}`,
          vehicleType: driver.vehicle_type,
          paymentIntentId: payment_intent_id,
        }).catch(emailError => {
          console.error('Email sending failed (non-critical):', emailError);
        });
      }
    } catch (emailError) {
      console.error('Email preparation failed (non-critical):', emailError);
    }
    
    const successResponse = { 
      success: true,
      data: response[0],
      message: "Chuyến đã được đặt thành công"
    };
    return new Response(
      JSON.stringify(successResponse), 
      { 
        status: 201,
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

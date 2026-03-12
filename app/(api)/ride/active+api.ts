import { neon } from "@neondatabase/serverless";

// GET: Lấy chuyến đang hoạt động của passenger
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

    // Lấy chuyến đang hoạt động (confirmed, driver_arrived, in_progress)
    const activeRides = await sql`
      SELECT 
        r.*,
        d.first_name as driver_first_name,
        d.last_name as driver_last_name,
        d.phone as driver_phone,
        d.profile_image_url as driver_profile_image,
        d.car_image_url as driver_car_image,
        d.vehicle_type as driver_vehicle_type,
        d.car_seats as driver_car_seats,
        d.rating as driver_rating
      FROM rides r
      LEFT JOIN drivers d ON r.driver_id = d.id
      WHERE r.user_id = ${userId}
        AND r.ride_status IN ('confirmed', 'driver_arrived', 'in_progress')
      ORDER BY r.created_at DESC
      LIMIT 1
    `;

    if (activeRides.length === 0) {
      return Response.json(
        {
          success: true,
          data: {
            active_ride: null,
          },
        },
        { status: 200 }
      );
    }

    const ride = activeRides[0];

    // Lấy lịch sử status events
    const events = await sql`
      SELECT *
      FROM ride_status_events
      WHERE ride_id = ${ride.ride_id}
      ORDER BY created_at ASC
    `;

    return Response.json(
      {
        success: true,
        data: {
          active_ride: {
            ...ride,
            status_events: events,
            driver: ride.driver_first_name
              ? {
                  first_name: ride.driver_first_name,
                  last_name: ride.driver_last_name,
                  phone: ride.driver_phone,
                  profile_image_url: ride.driver_profile_image,
                  car_image_url: ride.driver_car_image,
                  vehicle_type: ride.driver_vehicle_type,
                  car_seats: ride.driver_car_seats,
                  rating: ride.driver_rating,
                }
              : null,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: "Lỗi khi lấy thông tin chuyến",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

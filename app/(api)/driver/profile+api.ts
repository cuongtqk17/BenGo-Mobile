import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get("driver_id");
    const clerkId = searchParams.get("clerk_id");

    if (!driverId && !clerkId) {
      return Response.json(
        {
          success: false,
          error: "Thiếu driver_id hoặc clerk_id",
        },
        { status: 400 }
      );
    }

    const driverQuery = driverId
      ? sql`SELECT * FROM drivers WHERE id = ${driverId} LIMIT 1`
      : sql`SELECT * FROM drivers WHERE clerk_id = ${clerkId} LIMIT 1`;

    const driver = await driverQuery;

    if (driver.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Tài xế không tồn tại",
        },
        { status: 404 }
      );
    }

    const driverData = driver[0];

    // Get aggregated stats from rides table for accuracy
    const rideStats = await sql`
      SELECT 
        COUNT(*) as total_rides,
        COUNT(*) FILTER (WHERE ride_status = 'completed') as completed_rides,
        COUNT(*) FILTER (WHERE ride_status = 'cancelled') as cancelled_rides,
        COALESCE(SUM(fare_price) FILTER (WHERE ride_status = 'completed'), 0) as total_earnings
      FROM rides
      WHERE driver_id = ${driverData.id}
    `;

    const stats = rideStats[0];

    // Get recent rides (last 5)
    const recentRides = await sql`
      SELECT 
        ride_id,
        origin_address,
        destination_address,
        fare_price,
        ride_status,
        created_at
      FROM rides
      WHERE driver_id = ${driverData.id}
      ORDER BY created_at DESC
      LIMIT 5
    `;

    // Get recent ratings (last 5)
    const recentRatings = await sql`
      SELECT 
        r.id,
        r.stars,
        r.comment,
        r.created_at,
        u.name as user_name
      FROM ratings r
      LEFT JOIN users u ON r.user_id = u.clerk_id
      WHERE r.driver_id = ${driverData.id}
      ORDER BY r.created_at DESC
      LIMIT 5
    `;

    return Response.json(
      {
        success: true,
        data: {
          id: driverData.id,
          first_name: driverData.first_name,
          last_name: driverData.last_name,
          profile_image_url: driverData.profile_image_url,
          car_image_url: driverData.car_image_url,
          car_seats: driverData.car_seats,
          rating: driverData.rating,
          vehicle_type: driverData.vehicle_type,
          rating_count: driverData.rating_count || 0,
          average_rating: driverData.average_rating,
          clerk_id: driverData.clerk_id,
          email: driverData.email,
          phone: driverData.phone,
          license_number: driverData.license_number,
          approval_status: driverData.approval_status,
          status: driverData.status,
          total_rides: stats.total_rides.toString(),
          completed_rides: stats.completed_rides.toString(),
          cancelled_rides: stats.cancelled_rides.toString(),
          total_earnings: stats.total_earnings.toString(),
          warning_count: driverData.warning_count || 0,
          current_latitude: driverData.current_latitude,
          current_longitude: driverData.current_longitude,
          last_location_update: driverData.last_location_update,
          created_at: driverData.created_at,
          updated_at: driverData.updated_at,
          recentRides: recentRides.map((ride: any) => ({
            ride_id: ride.ride_id,
            origin_address: ride.origin_address,
            destination_address: ride.destination_address,
            fare_price: ride.fare_price,
            ride_status: ride.ride_status,
            created_at: ride.created_at,
          })),
          recentRatings: recentRatings.map((rating: any) => ({
            id: rating.id,
            stars: rating.stars,
            comment: rating.comment,
            created_at: rating.created_at,
            user_name: rating.user_name,
          })),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: "Lỗi khi lấy thông tin tài xế",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

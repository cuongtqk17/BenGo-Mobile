import { neon } from "@neondatabase/serverless";

// GET: Lấy chuyến đang hoạt động của driver
export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get("driver_id");

    if (!driverId) {
      return Response.json(
        {
          success: false,
          error: "Thiếu driver_id",
        },
        { status: 400 }
      );
    }

    // Lấy chuyến đang hoạt động (confirmed, driver_arrived, in_progress)
    const activeRides = await sql`
      SELECT 
        r.*,
        u.name as passenger_name,
        u.email as passenger_email
      FROM rides r
      LEFT JOIN users u ON r.user_id = u.clerk_id
      WHERE r.driver_id = ${driverId}
        AND r.ride_status IN ('confirmed', 'driver_arrived', 'in_progress')
      ORDER BY r.created_at DESC
    `;

    // Lấy lịch sử status events cho mỗi chuyến
    const ridesWithEvents = await Promise.all(
      activeRides.map(async (ride) => {
        const events = await sql`
          SELECT *
          FROM ride_status_events
          WHERE ride_id = ${ride.ride_id}
          ORDER BY created_at ASC
        `;

        return {
          ...ride,
          status_events: events,
        };
      })
    );

    return Response.json(
      {
        success: true,
        data: {
          active_rides: ridesWithEvents,
          count: ridesWithEvents.length,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: "Lỗi khi lấy danh sách chuyến",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

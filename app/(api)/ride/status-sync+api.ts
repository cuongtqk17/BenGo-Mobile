import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { searchParams } = new URL(request.url);
    const rideId = searchParams.get("ride_id");
    const lastCheck = searchParams.get("last_check");

    if (!rideId) {
      return Response.json(
        {
          success: false,
          error: "Thiếu ride_id",
        },
        { status: 400 }
      );
    }

    // Get current ride status
    const ride = await sql`
      SELECT 
        ride_id,
        ride_status,
        last_status_update,
        status_updated_by
      FROM rides
      WHERE ride_id = ${rideId}
      LIMIT 1
    `;

    if (ride.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Chuyến đi không tồn tại",
        },
        { status: 404 }
      );
    }

    const rideData = ride[0];
    const lastStatusUpdate = new Date(rideData.last_status_update || 0);
    const lastCheckDate = lastCheck ? new Date(lastCheck) : new Date(0);

    // Check if there are updates
    const hasUpdates = lastStatusUpdate > lastCheckDate;

    // Get events since last check
    let events: any[] = [];
    if (hasUpdates) {
      events = await sql`
        SELECT 
          id,
          event_type,
          old_status,
          new_status,
          changed_by,
          changed_by_id,
          metadata,
          created_at
        FROM ride_status_events
        WHERE ride_id = ${rideId}
          AND created_at > ${lastCheckDate.toISOString()}
        ORDER BY created_at ASC
      `;
    }

    // Get driver location if ride is active
    let driverLocation = null;
    if (
      ["confirmed", "driver_arrived", "in_progress"].includes(
        rideData.ride_status
      )
    ) {
      const driverData = await sql`
        SELECT 
          d.current_latitude,
          d.current_longitude,
          d.last_location_update
        FROM drivers d
        INNER JOIN rides r ON r.driver_id = d.id
        WHERE r.ride_id = ${rideId}
        LIMIT 1
      `;

      if (driverData.length > 0) {
        driverLocation = {
          latitude: parseFloat(driverData[0].current_latitude || 0),
          longitude: parseFloat(driverData[0].current_longitude || 0),
          updated_at: driverData[0].last_location_update,
        };
      }
    }

    return Response.json(
      {
        success: true,
        data: {
          ride_id: parseInt(rideId),
          current_status: rideData.ride_status,
          last_status_update: rideData.last_status_update,
          status_updated_by: rideData.status_updated_by,
          has_updates: hasUpdates,
          events: events.map((event: any) => ({
            id: event.id,
            event_type: event.event_type,
            old_status: event.old_status,
            new_status: event.new_status,
            changed_by: event.changed_by,
            changed_by_id: event.changed_by_id,
            metadata: event.metadata,
            created_at: event.created_at,
          })),
          driver_location: driverLocation,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: "Lỗi khi đồng bộ trạng thái",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

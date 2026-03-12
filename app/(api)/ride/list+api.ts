import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("Biến môi trường DATABASE_URL chưa được thiết lập");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const status = searchParams.get('status'); // 'all', 'active', 'completed', 'cancelled'
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';


    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "Missing user_id parameter" }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    // Find driver_id if this user is also a driver
    const driverResult = await sql`
      SELECT id FROM drivers WHERE clerk_id = ${user_id} LIMIT 1
    `;
    const driver_id = driverResult.length > 0 ? driverResult[0].id : null;

    // Helper to build the query conditions
    const getConditions = (statusCondition: string) => {
      if (driver_id) {
        return `(rides.user_id = '${user_id}' OR rides.driver_id = ${driver_id}) ${statusCondition ? `AND ${statusCondition}` : ''}`;
      }
      return `rides.user_id = '${user_id}' ${statusCondition ? `AND ${statusCondition}` : ''}`;
    };

    // Columns to select
    const selectColumns = `
      rides.ride_id,
      rides.origin_address,
      rides.destination_address,
      rides.origin_latitude,
      rides.origin_longitude,
      rides.destination_latitude,
      rides.destination_longitude,
      rides.ride_time,
      rides.fare_price,
      rides.payment_status,
      rides.ride_status,
      rides.created_at,
      rides.cancelled_at,
      rides.cancel_reason,
      rides.user_id AS passenger_id,
      json_build_object(
          'driver_id', drivers.id,
          'first_name', drivers.first_name,
          'last_name', drivers.last_name,
          'profile_image_url', drivers.profile_image_url,
          'car_image_url', drivers.car_image_url,
          'car_seats', drivers.car_seats,
          'rating', drivers.rating,
          'vehicle_type', drivers.vehicle_type
      ) AS driver,
      json_build_object(
          'clerk_id', users.clerk_id,
          'name', users.name,
          'email', users.email
      ) AS passenger
    `;

    let statusCondition = '';
    if (status && status !== 'all') {
      switch (status) {
        case 'active':
          statusCondition = "rides.ride_status IN ('confirmed', 'driver_arrived', 'in_progress')";
          break;
        case 'completed':
          statusCondition = "rides.ride_status = 'completed'";
          break;
        case 'cancelled':
          statusCondition = "rides.ride_status IN ('cancelled', 'no_show')";
          break;
      }
    }

    let response;
    const offsetNum = parseInt(offset);
    const limitNum = parseInt(limit);

    if (driver_id) {
      if (statusCondition) {
        // Driver with status filter
        response = await sql`
          SELECT 
            rides.ride_id, rides.origin_address, rides.destination_address,
            rides.origin_latitude, rides.origin_longitude, rides.destination_latitude,
            rides.destination_longitude, rides.ride_time, rides.fare_price,
            rides.payment_status, rides.ride_status, rides.created_at,
            rides.cancelled_at, rides.cancel_reason, rides.user_id AS passenger_id,
            json_build_object(
                'driver_id', drivers.id, 'first_name', drivers.first_name,
                'last_name', drivers.last_name, 'profile_image_url', drivers.profile_image_url,
                'car_image_url', drivers.car_image_url, 'car_seats', drivers.car_seats,
                'rating', drivers.rating, 'vehicle_type', drivers.vehicle_type
            ) AS driver,
            json_build_object(
                'clerk_id', users.clerk_id, 'name', users.name,
                'email', users.email, 'phone', users.phone
            ) AS passenger,
            CASE 
                WHEN ratings.id IS NOT NULL THEN json_build_object(
                    'id', ratings.id, 'stars', ratings.stars,
                    'comment', ratings.comment, 'created_at', ratings.created_at
                )
                ELSE NULL
            END AS rating
          FROM rides
          LEFT JOIN drivers ON rides.driver_id = drivers.id
          LEFT JOIN users ON rides.user_id = users.clerk_id
          LEFT JOIN ratings ON rides.ride_id = ratings.ride_id
          WHERE (rides.user_id = ${user_id} OR rides.driver_id = ${driver_id})
            AND (
              (${status === 'active'} AND rides.ride_status IN ('confirmed', 'driver_arrived', 'in_progress')) OR
              (${status === 'completed'} AND rides.ride_status = 'completed') OR
              (${status === 'cancelled'} AND rides.ride_status IN ('cancelled', 'no_show'))
            )
          ORDER BY rides.created_at DESC
          LIMIT ${limitNum} OFFSET ${offsetNum}
        `;
      } else {
        // Driver no status filter
        response = await sql`
          SELECT 
            rides.ride_id, rides.origin_address, rides.destination_address,
            rides.origin_latitude, rides.origin_longitude, rides.destination_latitude,
            rides.destination_longitude, rides.ride_time, rides.fare_price,
            rides.payment_status, rides.ride_status, rides.created_at,
            rides.cancelled_at, rides.cancel_reason, rides.user_id AS passenger_id,
            json_build_object(
                'driver_id', drivers.id, 'first_name', drivers.first_name,
                'last_name', drivers.last_name, 'profile_image_url', drivers.profile_image_url,
                'car_image_url', drivers.car_image_url, 'car_seats', drivers.car_seats,
                'rating', drivers.rating, 'vehicle_type', drivers.vehicle_type
            ) AS driver,
            json_build_object(
                'clerk_id', users.clerk_id, 'name', users.name,
                'email', users.email, 'phone', users.phone
            ) AS passenger,
            CASE 
                WHEN ratings.id IS NOT NULL THEN json_build_object(
                    'id', ratings.id, 'stars', ratings.stars,
                    'comment', ratings.comment, 'created_at', ratings.created_at
                )
                ELSE NULL
            END AS rating
          FROM rides
          LEFT JOIN drivers ON rides.driver_id = drivers.id
          LEFT JOIN users ON rides.user_id = users.clerk_id
          LEFT JOIN ratings ON rides.ride_id = ratings.ride_id
          WHERE (rides.user_id = ${user_id} OR rides.driver_id = ${driver_id})
          ORDER BY rides.created_at DESC
          LIMIT ${limitNum} OFFSET ${offsetNum}
        `;
      }
    } else {
      if (statusCondition) {
        // Passenger with status filter
        response = await sql`
          SELECT 
            rides.ride_id, rides.origin_address, rides.destination_address,
            rides.origin_latitude, rides.origin_longitude, rides.destination_latitude,
            rides.destination_longitude, rides.ride_time, rides.fare_price,
            rides.payment_status, rides.ride_status, rides.created_at,
            rides.cancelled_at, rides.cancel_reason, rides.user_id AS passenger_id,
            json_build_object(
                'driver_id', drivers.id, 'first_name', drivers.first_name,
                'last_name', drivers.last_name, 'profile_image_url', drivers.profile_image_url,
                'car_image_url', drivers.car_image_url, 'car_seats', drivers.car_seats,
                'rating', drivers.rating, 'vehicle_type', drivers.vehicle_type
            ) AS driver,
            json_build_object(
                'clerk_id', users.clerk_id, 'name', users.name,
                'email', users.email, 'phone', users.phone
            ) AS passenger,
            CASE 
                WHEN ratings.id IS NOT NULL THEN json_build_object(
                    'id', ratings.id, 'stars', ratings.stars,
                    'comment', ratings.comment, 'created_at', ratings.created_at
                )
                ELSE NULL
            END AS rating
          FROM rides
          LEFT JOIN drivers ON rides.driver_id = drivers.id
          LEFT JOIN users ON rides.user_id = users.clerk_id
          LEFT JOIN ratings ON rides.ride_id = ratings.ride_id
          WHERE rides.user_id = ${user_id}
            AND (
              (${status === 'active'} AND rides.ride_status IN ('confirmed', 'driver_arrived', 'in_progress')) OR
              (${status === 'completed'} AND rides.ride_status = 'completed') OR
              (${status === 'cancelled'} AND rides.ride_status IN ('cancelled', 'no_show'))
            )
          ORDER BY rides.created_at DESC
          LIMIT ${limitNum} OFFSET ${offsetNum}
        `;
      } else {
        // Passenger no status filter
        response = await sql`
          SELECT 
            rides.ride_id, rides.origin_address, rides.destination_address,
            rides.origin_latitude, rides.origin_longitude, rides.destination_latitude,
            rides.destination_longitude, rides.ride_time, rides.fare_price,
            rides.payment_status, rides.ride_status, rides.created_at,
            rides.cancelled_at, rides.cancel_reason, rides.user_id AS passenger_id,
            json_build_object(
                'driver_id', drivers.id, 'first_name', drivers.first_name,
                'last_name', drivers.last_name, 'profile_image_url', drivers.profile_image_url,
                'car_image_url', drivers.car_image_url, 'car_seats', drivers.car_seats,
                'rating', drivers.rating, 'vehicle_type', drivers.vehicle_type
            ) AS driver,
            json_build_object(
                'clerk_id', users.clerk_id, 'name', users.name,
                'email', users.email, 'phone', users.phone
            ) AS passenger,
            CASE 
                WHEN ratings.id IS NOT NULL THEN json_build_object(
                    'id', ratings.id, 'stars', ratings.stars,
                    'comment', ratings.comment, 'created_at', ratings.created_at
                )
                ELSE NULL
            END AS rating
          FROM rides
          LEFT JOIN drivers ON rides.driver_id = drivers.id
          LEFT JOIN users ON rides.user_id = users.clerk_id
          LEFT JOIN ratings ON rides.ride_id = ratings.ride_id
          WHERE rides.user_id = ${user_id}
          ORDER BY rides.created_at DESC
          LIMIT ${limitNum} OFFSET ${offsetNum}
        `;
      }
    }

    // Count total records
    let countResponse;
    if (driver_id) {
        countResponse = await sql`
          SELECT COUNT(*) as total FROM rides 
          WHERE (user_id = ${user_id} OR driver_id = ${driver_id})
          AND (
            (${!status || status === 'all'}) OR
            (${status === 'active'} AND ride_status IN ('confirmed', 'driver_arrived', 'in_progress')) OR
            (${status === 'completed'} AND ride_status = 'completed') OR
            (${status === 'cancelled'} AND ride_status IN ('cancelled', 'no_show'))
          )
        `;
    } else {
        countResponse = await sql`
          SELECT COUNT(*) as total FROM rides 
          WHERE user_id = ${user_id}
          AND (
            (${!status || status === 'all'}) OR
            (${status === 'active'} AND ride_status IN ('confirmed', 'driver_arrived', 'in_progress')) OR
            (${status === 'completed'} AND ride_status = 'completed') OR
            (${status === 'cancelled'} AND ride_status IN ('cancelled', 'no_show'))
          )
        `;
    }

    const totalCount = parseInt(countResponse[0].total);

    return new Response(
      JSON.stringify({ 
        success: true,
        data: response,
        isDriver: !!driver_id,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: response.length === parseInt(limit)
        }
      }),
      { 
        status: 200,
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


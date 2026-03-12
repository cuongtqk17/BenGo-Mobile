import { neon } from "@neondatabase/serverless";

// GET: Lấy danh sách chuyến chờ nhận (chưa có driver)
export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");
    const radius = searchParams.get("radius") || "10"; // km

    // Lấy các chuyến chưa có driver (driver_id = null hoặc 0)
    // và chưa bị hủy
    const availableRides = await sql`
      SELECT 
        r.*,
        u.name as passenger_name,
        u.email as passenger_email
      FROM rides r
      LEFT JOIN users u ON r.user_id = u.clerk_id
      WHERE (r.driver_id IS NULL OR r.driver_id = 0)
        AND r.ride_status NOT IN ('cancelled', 'completed', 'no_show')
        AND r.created_at >= NOW() - INTERVAL '1 hour'
      ORDER BY r.created_at DESC
      LIMIT 50
    `;

    // Nếu có vị trí driver, tính khoảng cách
    let ridesWithDistance = availableRides;
    if (latitude && longitude) {
      ridesWithDistance = availableRides.map((ride) => {
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          parseFloat(ride.origin_latitude),
          parseFloat(ride.origin_longitude)
        );

        return {
          ...ride,
          distance_km: distance,
        };
      });

      // Lọc theo bán kính
      ridesWithDistance = ridesWithDistance.filter(
        (ride) => ride.distance_km <= parseFloat(radius)
      );

      // Sắp xếp theo khoảng cách gần nhất
      ridesWithDistance.sort((a, b) => a.distance_km - b.distance_km);
    }

    return Response.json(
      {
        success: true,
        data: {
          available_rides: ridesWithDistance,
          count: ridesWithDistance.length,
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

// Hàm tính khoảng cách giữa 2 điểm (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Bán kính trái đất (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Làm tròn 1 chữ số thập phân
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

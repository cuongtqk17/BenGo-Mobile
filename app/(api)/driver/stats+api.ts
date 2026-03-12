import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL chưa được thiết lập");
}

// GET: Lấy thống kê chi tiết của driver
export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { searchParams } = new URL(request.url);
    const driver_id = searchParams.get("driver_id");

    if (!driver_id) {
      return Response.json(
        { error: "Thiếu driver_id" },
        { status: 400 }
      );
    }

    // Lấy thông tin driver
    const driver = await sql`
      SELECT 
        id,
        first_name,
        last_name,
        profile_image_url,
        car_seats,
        vehicle_type,
        rating as current_rating,
        rating_count,
        average_rating,
        bad_ratings_count,
        status,
        warning_count,
        last_warning_at,
        suspended_at,
        suspension_reason
      FROM drivers
      WHERE id = ${driver_id}
    `;

    if (driver.length === 0) {
      return Response.json(
        { error: "Không tìm thấy tài xế" },
        { status: 404 }
      );
    }

    // Lấy rating distribution
    const ratingDistribution = await sql`
      SELECT 
        stars,
        COUNT(*) as count
      FROM ratings
      WHERE driver_id = ${driver_id}
      GROUP BY stars
      ORDER BY stars DESC
    `;

    // Lấy 10 ratings gần nhất
    const recentRatings = await sql`
      SELECT 
        r.*,
        rides.origin_address,
        rides.destination_address,
        rides.created_at as ride_date
      FROM ratings r
      JOIN rides ON r.ride_id = rides.ride_id
      WHERE r.driver_id = ${driver_id}
      ORDER BY r.created_at DESC
      LIMIT 10
    `;

    // Đếm bad ratings trong 10 chuyến gần nhất
    const recentBadRatings = await sql`
      SELECT COUNT(*) as count
      FROM (
        SELECT stars 
        FROM ratings 
        WHERE driver_id = ${driver_id}
        ORDER BY created_at DESC 
        LIMIT 10
      ) recent
      WHERE stars <= 2
    `;

    // Tính performance metrics
    const performanceMetrics = await sql`
      SELECT 
        COUNT(*) as total_rides,
        COUNT(CASE WHEN ride_status = 'completed' THEN 1 END) as completed_rides,
        COUNT(CASE WHEN ride_status = 'cancelled' THEN 1 END) as cancelled_rides,
        ROUND(
          COUNT(CASE WHEN ride_status = 'completed' THEN 1 END)::numeric / 
          NULLIF(COUNT(*)::numeric, 0) * 100, 
          2
        ) as completion_rate
      FROM rides
      WHERE driver_id = ${driver_id}
    `;

    return Response.json(
      {
        success: true,
        data: {
          driver: driver[0],
          ratingDistribution: ratingDistribution.reduce((acc: any, curr: any) => {
            acc[`star_${curr.stars}`] = parseInt(curr.count);
            return acc;
          }, {}),
          recentRatings: recentRatings,
          recentBadRatingsCount: parseInt(recentBadRatings[0].count),
          performanceMetrics: performanceMetrics[0],
          riskLevel: calculateRiskLevel(
            driver[0],
            parseInt(recentBadRatings[0].count)
          ),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        error: "Lỗi máy chủ nội bộ",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function để tính risk level
function calculateRiskLevel(
  driver: any,
  recentBadCount: number
): string {
  const avgRating = parseFloat(driver.average_rating || 5);
  const badRatingsCount = parseInt(driver.bad_ratings_count || 0);
  const totalRatings = parseInt(driver.rating_count || 0);

  let riskScore = 0;

  // Average rating < 3.0 = +30 points
  if (avgRating < 3.0) riskScore += 30;
  else if (avgRating < 3.5) riskScore += 20;
  else if (avgRating < 4.0) riskScore += 10;

  // Recent bad ratings (trong 10 chuyến gần nhất)
  if (recentBadCount >= 5) riskScore += 40;
  else if (recentBadCount >= 3) riskScore += 25;
  else if (recentBadCount >= 2) riskScore += 15;

  // Bad ratings ratio
  if (totalRatings > 0) {
    const badRatio = badRatingsCount / totalRatings;
    if (badRatio > 0.4) riskScore += 20;
    else if (badRatio > 0.3) riskScore += 15;
    else if (badRatio > 0.2) riskScore += 10;
  }

  // Determine risk level
  if (riskScore >= 70) return "critical";
  if (riskScore >= 50) return "high";
  if (riskScore >= 30) return "medium";
  if (riskScore >= 10) return "low";
  return "minimal";
}

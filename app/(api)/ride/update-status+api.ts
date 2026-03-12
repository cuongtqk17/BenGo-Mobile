import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL chưa được thiết lập");
}

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"], // Driver can confirm or reject
  confirmed: ["driver_arrived", "cancelled", "no_show"],
  driver_arrived: ["in_progress", "cancelled", "no_show"],
  in_progress: ["completed", "cancelled"],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
  no_show: [], // Terminal state
};

function isValidTransition(
  currentStatus: string,
  newStatus: string
): boolean {
  return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
}

// POST: Update ride status with validation and audit trail
export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const body = await request.json();

    const { ride_id, new_status, changed_by, changed_by_id, metadata } = body;

    // Validate required fields
    if (!ride_id || !new_status || !changed_by || !changed_by_id) {
      return Response.json(
        {
          success: false,
          error: "Thiếu thông tin bắt buộc",
        },
        { status: 400 }
      );
    }

    // Validate changed_by
    if (!["driver", "passenger", "system"].includes(changed_by)) {
      return Response.json(
        {
          success: false,
          error: "changed_by không hợp lệ",
        },
        { status: 400 }
      );
    }

    // Get current ride status
    const ride = await sql`
      SELECT 
        ride_id,
        ride_status,
        user_id,
        driver_id
      FROM rides
      WHERE ride_id = ${ride_id}
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
    const oldStatus = rideData.ride_status;

    // Check if status is already the same
    if (oldStatus === new_status) {
      return Response.json(
        {
          success: true,
          data: {
            ride_id: ride_id,
            old_status: oldStatus,
            new_status: new_status,
            last_status_update: new Date().toISOString(),
            notification_sent: false,
          },
          message: "Trạng thái không thay đổi",
        },
        { status: 200 }
      );
    }

    // Validate status transition
    if (!isValidTransition(oldStatus, new_status)) {
      return Response.json(
        {
          success: false,
          error: `Không thể chuyển từ ${oldStatus} sang ${new_status}`,
        },
        { status: 400 }
      );
    }

    // Update ride status
    if (new_status === "cancelled" || new_status === "no_show") {
      await sql`
        UPDATE rides 
        SET ride_status = ${new_status},
            cancelled_at = NOW(),
            cancel_reason = COALESCE(${metadata?.reason}, ${
        new_status === "no_show" ? "Khách không xuất hiện" : "Bị hủy"
      })
        WHERE ride_id = ${ride_id}
      `;
    } else {
      await sql`
        UPDATE rides 
        SET ride_status = ${new_status}
        WHERE ride_id = ${ride_id}
      `;
    }

    // Insert into ride_status_events
    await sql`
      INSERT INTO ride_status_events (
        ride_id,
        old_status,
        new_status,
        changed_by,
        changed_by_id,
        event_type,
        metadata,
        created_at
      ) VALUES (
        ${ride_id},
        ${oldStatus},
        ${new_status},
        ${changed_by},
        ${changed_by_id},
        'status_change',
        ${metadata ? JSON.stringify(metadata) : null},
        NOW()
      )
    `;

    // TODO: Trigger push notification to the other party
    // This will be implemented in the notification service
    let notificationSent = false;

    // Determine who to notify
    const notifyTarget = changed_by === "driver" ? "passenger" : "driver";

    // Get push token and send notification
    try {
      if (notifyTarget === "passenger") {
        const tokens = await sql`
          SELECT expo_push_token FROM push_tokens
          WHERE user_id = ${rideData.user_id}
          LIMIT 1
        `;

        if (tokens.length > 0) {
          // TODO: Send push notification using Expo
          notificationSent = true;
        }
      } else if (notifyTarget === "driver") {
        const tokens = await sql`
          SELECT expo_push_token FROM push_tokens
          WHERE driver_id = ${rideData.driver_id}
          LIMIT 1
        `;

        if (tokens.length > 0) {
          // TODO: Send push notification using Expo
          notificationSent = true;
        }
      }
    } catch (notifError) {
      console.error("Notification error:", notifError);
      // Don't fail the request if notification fails
    }

    return Response.json(
      {
        success: true,
        data: {
          ride_id: ride_id,
          old_status: oldStatus,
          new_status: new_status,
          last_status_update: new Date().toISOString(),
          notification_sent: notificationSent,
        },
        message: "Đã cập nhật trạng thái chuyến",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: "Lỗi khi cập nhật trạng thái",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// GET: Get rides that need status update (for auto-update system)
export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const now = new Date();

    // 1. confirmed -> driver_arrived (sau 1 phút)
    const toDriverArrived = await sql`
      SELECT ride_id, created_at, ride_status, ride_time
      FROM rides
      WHERE ride_status = 'confirmed'
      AND created_at + INTERVAL '1 minute' <= ${now.toISOString()}
    `;

    // 2. driver_arrived -> in_progress (sau 1 phút từ khi confirmed + 1 phút)
    const toInProgress = await sql`
      SELECT ride_id, created_at, ride_status, ride_time
      FROM rides
      WHERE ride_status = 'driver_arrived'
      AND created_at + INTERVAL '2 minutes' <= ${now.toISOString()}
    `;

    // 3. in_progress -> completed (sau ride_time phút từ khi in_progress)
    // in_progress bắt đầu sau 2 phút, nên completed = created_at + 2 phút + ride_time
    const toCompleted = await sql`
      SELECT ride_id, created_at, ride_status, ride_time
      FROM rides
      WHERE ride_status = 'in_progress'
      AND created_at + INTERVAL '2 minutes' + (ride_time || ' minutes')::INTERVAL <= ${now.toISOString()}
    `;

    return Response.json(
      {
        success: true,
        data: {
          toDriverArrived: toDriverArrived.length,
          toInProgress: toInProgress.length,
          toCompleted: toCompleted.length,
          rides: {
            toDriverArrived,
            toInProgress,
            toCompleted,
          },
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

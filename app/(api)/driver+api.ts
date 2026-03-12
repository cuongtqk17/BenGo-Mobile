import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get("clerk_id");
    
    const sql = neon(`${process.env.DATABASE_URL}`);
    
    const query = clerkId
      ? sql`
          SELECT * FROM drivers 
          WHERE approval_status = 'approved' 
          AND status = 'online'
          AND clerk_id != ${clerkId}
        `
      : sql`
          SELECT * FROM drivers 
          WHERE approval_status = 'approved' 
          AND status = 'online'
        `;

    const response = await query;

    return Response.json({ data: response });
  } catch (error) {
    return Response.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
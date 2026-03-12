import { neon } from '@neondatabase/serverless';

export async function GET(request: Request) {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { searchParams } = new URL(request.url);
        const clerkId = searchParams.get('clerkId');


        if (!clerkId) {
            return Response.json(
                { success: false, error: 'Missing clerkId parameter' },
                { status: 400 }
            );
        }

        const allUsers = await sql`SELECT * FROM users`;
        const user = allUsers.find((u: any) => u.clerk_id === clerkId);

        if (!user) {
            return Response.json(
                { success: true, data: null },
                { status: 200 }
            );
        }

        const ridesCount = await sql`
            SELECT 
                COUNT(*) AS total_rides,
                COUNT(*) FILTER (WHERE ride_status = 'completed') AS completed_rides
            FROM rides 
            WHERE user_id = ${clerkId}
        `;

        const finalData = {
            ...user,
            total_rides: ridesCount[0].total_rides || "0",
            completed_rides: ridesCount[0].completed_rides || "0"
        };



        return Response.json(
            { success: true, data: finalData },
            { status: 200 }
        );
    } catch (error: any) {

        return Response.json(
            { success: false, error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const {name, email, clerkId, phone} = await request.json();

    if (!name || !email || !clerkId) {
        return Response.json(
            {error: 'Missing required fields'},
            {status: 400}
        )
    }

    const response = await sql`
        INSERT INTO users (
            name, 
            email, 
            clerk_id,
            phone
        )
        VALUES (${name}, ${email}, ${clerkId}, ${phone || null})
        ON CONFLICT (email) DO UPDATE
        SET 
            name = EXCLUDED.name,
            clerk_id = EXCLUDED.clerk_id,
            phone = EXCLUDED.phone
        RETURNING *
    `;

    return new Response(JSON.stringify({data: response[0]}), {status: 200});
    }
    catch (error) {

        return Response.json({error: error}, {status: 500});
    }
}
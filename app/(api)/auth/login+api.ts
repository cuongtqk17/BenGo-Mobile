import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { email, phone, password } = await request.json();

    // In a real app, you would hash and compare passwords.
    // For this demonstration, we'll search by email or phone.
    let user;
    if (email) {
      const result = await sql`SELECT * FROM users WHERE email = ${email}`;
      user = result[0];
    } else if (phone) {
      const result = await sql`SELECT * FROM users WHERE phone = ${phone}`;
      user = result[0];
    }

    if (!user) {
      return Response.json(
        { success: false, message: 'Tài khoản không tồn tại' },
        { status: 404 }
      );
    }

    // Mocking password check and role
    // In a real implementation, you'd check user.password === hashed(password)
    // and the user.role would come from the database.
    
    const mockAccessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_payload_${user.id}`;
    
    return Response.json({
      success: true,
      accessToken: mockAccessToken,
      user: {
        id: user.clerk_id || user.id, // Using clerk_id as fallback id
        phone: user.phone,
        name: user.name,
        role: user.role || 'DRIVER', // Defaulting to DRIVER as requested in login screen context
        email: user.email
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Login API Error:', error);
    return Response.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

import { uploadImageToCloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { base64, folder, publicId } = body;

    if (!base64) {
      return Response.json(
        {
          success: false,
          error: "Missing base64 image data",
        },
        { status: 400 }
      );
    }

    const result = await uploadImageToCloudinary(
      base64,
      folder || "uber-clone/driver-temp",
      publicId || `temp_${Date.now()}`
    );

    return Response.json(
      {
        success: true,
        data: {
          url: result.secure_url,
          public_id: result.public_id,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: "Failed to upload image",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

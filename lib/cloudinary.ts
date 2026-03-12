import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export async function uploadImageToCloudinary(
  base64Data: string,
  folder: string = "uber-clone",
  publicId?: string
): Promise<CloudinaryUploadResult> {
  try {
    // Ensure base64 data has the correct prefix
    const base64String = base64Data.startsWith("data:")
      ? base64Data
      : `data:image/jpeg;base64,${base64Data}`;

    const uploadOptions: any = {
      folder,
      resource_type: "image",
      transformation: [
        { width: 1200, height: 1200, crop: "limit" },
        { quality: "auto:good" }, 
        { fetch_format: "auto" }, 
      ],
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const result = await cloudinary.uploader.upload(
      base64String,
      uploadOptions
    );

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  } catch (error: any) {
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
}

export async function uploadFileToCloudinary(
  file: File | Blob,
  folder: string = "uber-clone",
  publicId?: string
): Promise<CloudinaryUploadResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    return await uploadImageToCloudinary(base64, folder, publicId);
  } catch (error: any) {
    throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
  }
}

export async function deleteImageFromCloudinary(
  publicId: string
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
  }
}

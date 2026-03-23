import { v2 as cloudinary, type UploadApiOptions } from "cloudinary";

let isConfigured = false;

export function configureCloudinary() {
  if (isConfigured) {
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary env vars are missing");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  isConfigured = true;
}

export async function uploadImage(
  file: string,
  options: UploadApiOptions = {},
) {
  configureCloudinary();

  const result = await cloudinary.uploader.upload(file, {
    folder: "gallery",
    ...options,
  });

  return result.secure_url;
}

export default cloudinary;

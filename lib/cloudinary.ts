import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  secure: true, // uses HTTPS
});

export const uploadImage = async (file: string) => {
  // file can be base64 or URL
  const result = await cloudinary.uploader.upload(file, {
    folder: "gallery", // optional folder
  });
  return result.secure_url;
};

export default cloudinary;

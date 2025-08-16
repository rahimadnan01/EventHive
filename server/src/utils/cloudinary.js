import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: "dqolqioqw",
  api_key: "159755157937872",
  api_secret: "y_eL4nQRiJ00rW2C8LehxlJG0SM",
});

// Upload an image
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }
    if (!fs.existsSync(localFilePath)) {
      console.log("file not found ", localFilePath);
      return null;
    }
    let response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log("failed to upload media file due to ", error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };

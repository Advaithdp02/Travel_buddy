import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/awsS3.js";
import sharp from "sharp";

/**
 * Upload and automatically optimize image before upload
 */
export const uploadToS3 = async (fileBuffer, fileName, folder, mimeType) => {
  // 🔥 AUTO OPTIMIZE IMAGE HERE
  const optimizedBuffer = await sharp(fileBuffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  // Convert file name to .webp
  const newFileName = fileName.replace(/\.\w+$/, ".webp");

  const fileKey = `${folder}/${Date.now()}-${newFileName}`;

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: fileKey,
    Body: optimizedBuffer,
    ContentType: "image/webp",
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  return `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${fileKey}`;
};

/**
 * Delete from S3
 */
export const deleteFromS3 = async (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== "string") return;

  try {
    const key = fileUrl.split(".amazonaws.com/")[1];
    if (!key) return; // ⬅️ PREVENT CRASH

    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: key,
    };

    await s3.send(new DeleteObjectCommand(params));
    console.log(`🗑️ Deleted old file from S3: ${key}`);

  } catch (error) {
    console.error("❌ Failed to delete from S3:", error.message);
  }
};


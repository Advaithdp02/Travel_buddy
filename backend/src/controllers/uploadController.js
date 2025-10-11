import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/awsS3.js";

/**
 * Upload a file buffer to S3 and return its URL
 */
export const uploadToS3 = async (fileBuffer, fileName, folder, mimeType) => {
  const fileKey = `${folder}/${Date.now()}-${fileName}`;

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: mimeType,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  return `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${fileKey}`;
};

/**
 * Delete a file from S3 using its URL
 */
export const deleteFromS3 = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    // Extract Key from full URL
    const key = fileUrl.split(".amazonaws.com/")[1];

    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: key,
    };

    const command = new DeleteObjectCommand(params);
    await s3.send(command);
    console.log(`🗑️ Deleted old file from S3: ${key}`);
  } catch (error) {
    console.error("❌ Failed to delete from S3:", error.message);
  }
};

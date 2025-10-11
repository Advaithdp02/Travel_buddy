import multer from "multer";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";


// Load .env
dotenv.config();


// Verify ENV values
console.log("✅ S3 Config Loaded:");
console.log({
  bucket: process.env.BUCKET_NAME,
  region: process.env.BUCKET_REGION,
  accessKeyLoaded: !!process.env.BUCKET_ACCESS_KEY,
  secretKeyLoaded: !!process.env.BUCKET_SECRET_KEY
});

// Create S3 Client
export const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.BUCKET_SECRET_KEY
  }
});


import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../utils/S3config";
import logger from "../utils/logger";

class FileManager {
  async uploadFile(file: any) {
    logger.info(`Uploading file: ${file.originalFilename}`);
    try {
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file.uniqueKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3.send(command);

      const presignedUrl = await this.urlPresigner(file.originalFilename);

      logger.info(
        `File uploaded successfully: ${file.originalFilename} with key: ${file.uniqueKey}`
      );
      return {
        message: "Successfully uploaded file to S3",
        url: presignedUrl,
        fileRef: file.uniqueKey,
      };
    } catch (error) {
      logger.error(`File upload failed: ${error.message}`);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  async deleteFile(fileKey: string) {
    logger.info(`Deleting file: ${fileKey}`);
    try {
      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
      };

      const command = new DeleteObjectCommand(deleteParams);
      await s3.send(command);

      logger.info(`File deleted successfully: ${fileKey}`);
      return { message: `File ${fileKey} was successfully deleted` };
    } catch (error) {
      logger.error(`File deletion failed: ${error.message}`);
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  async deleteMultipleFiles(fileNames: string[]) {
    logger.info(`Deleting multiple files: ${fileNames.join(", ")}`);
    try {
      const deletePromises = fileNames.map((filekey) => {
        const deleteParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: filekey,
        };
        const command = new DeleteObjectCommand(deleteParams);
        return s3.send(command);
      });

      await Promise.all(deletePromises);

      logger.info(`Files deleted successfully: ${fileNames.join(", ")}`);
      return {
        message: `Files ${fileNames.join(", ")} were successfully deleted`,
      };
    } catch (error) {
      logger.error(`File deletion failed: ${error.message}`);
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  async urlPresigner(filename: string) {
    logger.info(`Generating presigned URL for file: ${filename}`);
    try {
      if (filename === undefined) throw new Error("Filename is required");

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filename,
      };

      const command = new GetObjectCommand(params);

      const url = await getSignedUrl(s3, command, {
        expiresIn: 60 * 60 * 24 * 7,
      });

      logger.info(`Presigned URL generated for file: ${filename}`);
      return url;
    } catch (error) {
      logger.error(`URL generation failed: ${error.message}`);
      throw new Error(`URL generation failed: ${error.message}`);
    }
  }
}

export default FileManager;

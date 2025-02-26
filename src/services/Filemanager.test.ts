import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import FileManager from "./FileManager";
import s3 from "../utils/S3config";
import logger from "../utils/logger";

jest.mock("@aws-sdk/client-s3");
jest.mock("@aws-sdk/s3-request-presigner");
jest.mock("../utils/S3config");
jest.mock("../utils/logger");

describe("FileManager", () => {
  let fileManager: FileManager;

  beforeEach(() => {
    fileManager = new FileManager();
    jest.clearAllMocks();
  });

  describe("uploadFile", () => {
    it("should upload a file and return the presigned URL", async () => {
      const file = {
        originalFilename: "test.pdf",
        uniqueKey: "unique-test.pdf",
        buffer: Buffer.from("test content"),
        mimetype: "application/pdf",
      };

      const presignedUrl = "https://example.com/presigned-url";
      (getSignedUrl as jest.Mock).mockResolvedValue(presignedUrl);

      const result = await fileManager.uploadFile(file);

      expect(s3.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
      expect(result).toEqual({
        message: "Successfully uploaded file to S3",
        url: presignedUrl,
        fileRef: file.uniqueKey,
      });
      expect(logger.info).toHaveBeenCalledWith(`Uploading file: ${file.originalFilename}`);
      expect(logger.info).toHaveBeenCalledWith(`File uploaded successfully: ${file.originalFilename} with key: ${file.uniqueKey}`);
    });

    it("should log an error and throw an error if upload fails", async () => {
      const file = {
        originalFilename: "test.pdf",
        uniqueKey: "unique-test.pdf",
        buffer: Buffer.from("test content"),
        mimetype: "application/pdf",
      };

      const errorMessage = "Upload failed";
      (s3.send as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(fileManager.uploadFile(file)).rejects.toThrow(`File upload failed: ${errorMessage}`);
      expect(logger.error).toHaveBeenCalledWith(`File upload failed: ${errorMessage}`);
    });
  });

  describe("deleteFile", () => {
    it("should delete a file and return a success message", async () => {
      const fileKey = "unique-test.pdf";

      const result = await fileManager.deleteFile(fileKey);

      expect(s3.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
      expect(result).toEqual({ message: `File ${fileKey} was successfully deleted` });
      expect(logger.info).toHaveBeenCalledWith(`Deleting file: ${fileKey}`);
      expect(logger.info).toHaveBeenCalledWith(`File deleted successfully: ${fileKey}`);
    });

    it("should log an error and throw an error if deletion fails", async () => {
      const fileKey = "unique-test.pdf";

      const errorMessage = "Deletion failed";
      (s3.send as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(fileManager.deleteFile(fileKey)).rejects.toThrow(`File deletion failed: ${errorMessage}`);
      expect(logger.error).toHaveBeenCalledWith(`File deletion failed: ${errorMessage}`);
    });
  });

  describe("deleteMultipleFiles", () => {
    it("should delete multiple files and return a success message", async () => {
      const fileKeys = ["unique-test1.pdf", "unique-test2.pdf"];

      const result = await fileManager.deleteMultipleFiles(fileKeys);

      expect(s3.send).toHaveBeenCalledTimes(fileKeys.length);
      expect(result).toEqual({ message: `Files ${fileKeys.join(", ")} were successfully deleted` });
      expect(logger.info).toHaveBeenCalledWith(`Deleting multiple files: ${fileKeys.join(", ")}`);
      expect(logger.info).toHaveBeenCalledWith(`Files deleted successfully: ${fileKeys.join(", ")}`);
    });

    it("should log an error and throw an error if deletion fails", async () => {
      const fileKeys = ["unique-test1.pdf", "unique-test2.pdf"];

      const errorMessage = "Deletion failed";
      (s3.send as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(fileManager.deleteMultipleFiles(fileKeys)).rejects.toThrow(`File deletion failed: ${errorMessage}`);
      expect(logger.error).toHaveBeenCalledWith(`File deletion failed: ${errorMessage}`);
    });
  });

  describe("urlPresigner", () => {
    it("should generate a presigned URL for a file", async () => {
      const filename = "unique-test.pdf";
      const presignedUrl = "https://example.com/presigned-url";
      (getSignedUrl as jest.Mock).mockResolvedValue(presignedUrl);

      const result = await fileManager.urlPresigner(filename);

      expect(getSignedUrl).toHaveBeenCalledWith(s3, expect.any(GetObjectCommand), { expiresIn: 60 * 60 * 24 * 7 });
      expect(result).toEqual(presignedUrl);
      expect(logger.info).toHaveBeenCalledWith(`Generating presigned URL for file: ${filename}`);
      expect(logger.info).toHaveBeenCalledWith(`Presigned URL generated for file: ${filename}`);
    });

    it("should log an error and throw an error if URL generation fails", async () => {
      const filename = "unique-test.pdf";

      const errorMessage = "URL generation failed";
      (getSignedUrl as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(fileManager.urlPresigner(filename)).rejects.toThrow(`URL generation failed: ${errorMessage}`);
      expect(logger.error).toHaveBeenCalledWith(`URL generation failed: ${errorMessage}`);
    });
  });
});
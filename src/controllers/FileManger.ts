import express from "express";
import FileManager from "../services/FileManager";
import { fileSchema, fileKeySchema, fileKeySchemaArray } from "../validators";
import fs from "fs";
import { SanitizedFile } from "./interfaces";
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const fileManagerI = new FileManager();

router.post("/upload", async (req, res, next) => {
  try {
    const { files } = req;

    let sanitizedFile: SanitizedFile = {
      originalFilename: files.file[0].originalFilename,
      mimetype: files.file[0].mimetype,
      size: files.file[0].size,
    };

    const { error } = fileSchema.validate(sanitizedFile);
    if (error) throw new Error(error.message);

    fs.readFile(files.file[0].filepath, async (err, data) => {
      if (err) throw new Error("File reading failed");
      sanitizedFile.buffer = data;

      const uniqueKey = `${uuidv4()}.pdf`;

      try {
        const uploadResponse = await fileManagerI.uploadFile({...sanitizedFile, uniqueKey});
        res.status(200).send(uploadResponse);
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
});



router.delete("/delete-multiple", async (req, res, next) => {
    const { error } = fileKeySchemaArray.validate(req.body.filenames);
    if (error) {
      res.status(400).send(error.message);
      return;
    }
    try {
      const { filenames } = req.body;

      const deleteFile = await fileManagerI.deleteMultipleFiles(filenames);
  
      res.status(200).send(deleteFile);
    } catch (error) {
      next(error);
    }
  });

router.delete("/delete", async (req, res, next) => {
  const { error } = fileKeySchema.validate(req.query);
  if (error) {
    res.status(400).send(error.message);
    return;
  }
  try {
    const { filename } = req.query;

    const deleteFile = await fileManagerI.deleteFile(filename);

    res.status(200).send(deleteFile);
  } catch (error) {
    next(error);
  }
});

export default router;

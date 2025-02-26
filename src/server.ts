import express from "express";
import cors from "cors";
import "dotenv/config";
import fileMangerRouter from "./controllers/FileManger";
import fileParser from "./middlewares/fileParser";
import logger from "./utils/logger";
import apiKeyValidator from "./middlewares/ValidateApiKey";
import art from "./art";
import validateEnvVariables from "./utils/validateEnv";

validateEnvVariables();


const app = express();

app.use(cors());

app.use("/api",apiKeyValidator, fileParser, fileMangerRouter);

app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(art);
});

import express from "express";
import dotenv from "dotenv";

import { notFound } from "#common/middleware/not-found.js";
import { handleValidationError } from "#common/middleware/validate.js";
import { errorHandler } from "#common/middleware/error-handler.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(handleValidationError);
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

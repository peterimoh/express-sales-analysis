import express from "express";
import dotenv from "dotenv";
import { z } from "zod";

import { notFound } from "#common/middleware/not-found.js";
import {
  handleValidationError,
  validateRequest,
} from "#common/middleware/validate.js";
import { errorHandler } from "#common/middleware/error-handler.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const schema = z.object({
  name: z.string().min(1),
  age: z.number().min(18),
});

app.get("/", (_, res) => {
  res.status(200).json({ message: "Hello World" });
});

app.post("/", validateRequest({ body: schema }), (req, res) => {
  res.status(200).json({ message: "Hello World" });
});

app.use(handleValidationError);
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

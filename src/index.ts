import express from "express";
import dotenv from "dotenv";

import routes from "#routes/index.js";
import { notFound } from "#common/middleware/not-found.js";
import { handleValidationError } from "#common/middleware/validate.js";
import { errorHandler } from "#common/middleware/error-handler.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(handleValidationError);
app.use(errorHandler);
app.use(notFound);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`V1 API available at http://localhost:${port}/api/v1`);
});

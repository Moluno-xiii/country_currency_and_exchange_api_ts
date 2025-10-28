import cors from "cors";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import indexRoute from "./routes/indexRoute";
import countriesRoute from "./routes/countriesRoute";

const corsOptions = {
  optionsSuccessStatus: 200,
  credentials: true,
  allowedHeaders: ["Content-Type", "X-Device-Id"],
};

const app = express();
app.use(cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());

app.use("/", indexRoute);
app.use("/countries", countriesRoute);
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;

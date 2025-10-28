import { Router, Request, Response, NextFunction } from "express";
const indexRoute = Router();

indexRoute.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Welcome to the currencies api",
    instructions: "Navigate to /countries/refresh to get started",
  });
});

indexRoute.post("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ message: "" });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

export default indexRoute;

import { Router, Request, Response, NextFunction } from "express";
const indexRoute = Router();

indexRoute.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Welcome to the currencies api",
    instructions: "Navigate to /countries/refresh to get started",
  });
});

export default indexRoute;

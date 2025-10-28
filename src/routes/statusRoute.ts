import { Router, Request, Response, NextFunction } from "express";
import countriesStatus from "../utils/countriesStatus";
const statusRoute = Router();

statusRoute.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({
    total_countries: countriesStatus.getTotal(),
    last_refreshed_at: countriesStatus.getRefreshDate(),
  });
});

export default statusRoute;

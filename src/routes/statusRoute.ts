import { NextFunction, Request, Response, Router } from "express";
import { getLastUpdate, getTableCount } from "../db/dbQuery";
const statusRoute = Router();

statusRoute.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [last_refreshed_at, count] = await Promise.all([
        getLastUpdate(),
        getTableCount(),
      ]);
      res.json({
        last_refreshed_at,
        total_countries: count[0].total_countries,
      });
    } catch (err) {
      res.status(500).json({
        message:
          err instanceof Error ? err.message : "Unexpected error occured",
      });
    }
  }
);

export default statusRoute;

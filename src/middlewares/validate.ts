import { NextFunction, Request, Response } from "express";
import * as z from "zod";

const validate = (schema: z.Schema, property: "query" | "params" | "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[property]);
      Object.assign(req[property], parsed);
      next();
    } catch (err: any) {
      console.error("Validation error:", err);
      return res.status(400).json({
        message: "Validation failed",
        details: err.errors || err.message,
      });
    }
  };
};

export default validate;

import { Request, Response, NextFunction } from "express";
import { authorize } from "../gmail/auth.mjs";

export const authMiddleware = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticated = await authorize();
    if (!authenticated) {
      throw "No Authenticated";
    }
    next();
  } catch (e) {
    res.status(401);
    res.send({ error: e });
  }
};

import * as auth from "../functions/gmail-auth.mjs";
import { Request, Response, NextFunction } from "express";

export const authMiddleware = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticated = await auth.authorize();
    if (!authenticated) {
      throw "No Authenticated";
    }
    next();
  } catch (e) {
    res.status(401);
    res.send({ error: e });
  }
};

import { Router } from "express";

import config from "../config.mjs";
import { createDynamicKeyPassword } from "../functions/tuyaFns.mjs";

const router = Router();

// https://stackoverflow.com/questions/74994699/how-do-i-encrypt-a-password-for-tuya-smart-lock-open-api

class InvalidRequestError extends Error {
  constructor(message: string, reason: "code" | "message" = "code") {
    super(message);
    this.name = "InvalidRequestError";
  }
}

router.get("/ticket", async (req, res) => {
  try {
    const now = new Date().getTime();
    const tempPassword = await createDynamicKeyPassword(
      "Test",
      "1234567",
      now,
      now + 10 * 60 * 1000
    );

    return res.send(tempPassword);
  } catch (err) {
    if (err instanceof InvalidRequestError) {
      return res.send({ error: err.message }).status(400);
    }

    return res.send({ error: "Failed to get token" }).status(500);
  }
});

router.get("/encrypt", async (req, res) => {});

export { router };

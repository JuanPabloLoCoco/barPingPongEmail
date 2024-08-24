import { Router } from "express";
import { createHmac, createHash } from "crypto";
import qs from "qs";
import { getSignedPassword } from "../functions/tuyaFns";
import config from "../config";

const router = Router();

// https://stackoverflow.com/questions/74994699/how-do-i-encrypt-a-password-for-tuya-smart-lock-open-api

interface GetTokenResult {
  result: {
    access_token: string;
    expire_time: number;
    refresh_token: string;
    uid: string;
  };
  success: boolean;
  t: number;
  tid: string;
}

class InvalidRequestError extends Error {
  constructor(message: string, reason: "code" | "message" = "code") {
    super(message);
    this.name = "InvalidRequestError";
  }
}

async function getSignedToken(): Promise<GetTokenResult> {
  const signUrl = "/v1.0/token?grant_type=1";
  const headers: Headers = await getTokenSigned(config.tuya.accessKey);

  const data = await fetch(`${config.tuya.host}${signUrl}`, {
    method: "GET",
    headers,
  });

  if (!data.ok) {
    throw new InvalidRequestError("Failed to get token");
  }

  const tokenResult = (await data.json()) as GetTokenResult;
  if (!tokenResult.success) {
    throw new InvalidRequestError("Failed to get token");
  }
  return tokenResult;
}

interface GetPasswordTicketRes {
  code: number;
  success: boolean;
  t: number;
  msg: string;
  result: {
    ticket_id: string;
    ticket_key: string;
    expire_time: number;
  };
}

async function getPasswordTicket(token: string): Promise<GetPasswordTicketRes> {
  const signUrl = `/v1.0/devices/${config.tuya.deviceId}/door-lock/password-ticket`;

  const headers = await getRequestSign(token, signUrl, "POST", {}, {}, "");
  const data = await fetch(`${config.tuya.host}${signUrl}`, {
    method: "POST",
    headers,
  });

  if (!data.ok) {
    throw new InvalidRequestError("Failed to get password ticket", "code");
  }

  const ticketResult = (await data.json()) as GetPasswordTicketRes;
  if (!ticketResult.success) {
    throw new InvalidRequestError("Failed to get password ticket", "message");
  }

  return ticketResult;
}

interface createTemporaryPasswordRes {
  code: number;
  success: boolean;
  t: number;
  msg: string;
  result: {
    id: number;
  };
}

async function createTemporaryPassword(
  token: string,
  ticket_id: string,
  ticketKey: string
) {
  const signUrl = `/v1.0/devices/${config.tuya.deviceId}/door-lock/temp-password`;

  const effective_time = Date.now() + 360;
  const invalid_time = effective_time + 360000;

  const password = getSignedPassword(
    "1234567",
    ticketKey,
    config.tuya.secretKey
  );

  const body = {
    name: "Test 1",
    password,
    effective_time,
    invalid_time,
    password_type: "ticket",
    ticket_id,
  };

  const headers = await getRequestSign(token, signUrl, "POST", {}, {}, body);

  const url = `${config.tuya.host}${signUrl}`;
  const data = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!data.ok) {
    throw new InvalidRequestError("Failed to create password", "code");
  }

  const passwordResult = (await data.json()) as createTemporaryPasswordRes;
  if (!passwordResult.success) {
    throw new InvalidRequestError("Failed to create password", "message");
  }

  return passwordResult;
}

router.get("/token", async (req, res) => {
  try {
    const token = await getSignedToken();
    return res.send(token);
  } catch (err) {
    if (err instanceof InvalidRequestError) {
      return res.send({ error: err.message }).status(400);
    }

    return res.send({ error: "Failed to get token" }).status(400);
  }
});

router.get("/ticket", async (req, res) => {
  try {
    const token = await getSignedToken();

    const ticket = await getPasswordTicket(token.result.access_token);

    const tempPassword = await createTemporaryPassword(
      token.result.access_token,
      ticket.result.ticket_id,
      ticket.result.ticket_key
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

/**
 * HMAC-SHA256 crypto function
 */
async function encryptStr(str: string, secret: string): Promise<string> {
  return createHmac("sha256", secret)
    .update(str, "utf8")
    .digest("hex")
    .toUpperCase();
}

export async function getTokenSigned(clientId: string): Promise<Headers> {
  const timestamp = Date.now().toString();
  const signUrl = "/v1.0/token?grant_type=1";
  const contentHash = createHash("sha256").update("").digest("hex");
  const stringToSign = ["GET", contentHash, "", signUrl].join("\n");
  const signStr = clientId + timestamp + stringToSign;

  return {
    // @ts-expect-error
    t: timestamp,
    sign_method: "HMAC-SHA256",
    client_id: config.tuya.accessKey,
    sign: await encryptStr(signStr, config.tuya.secretKey),
  };
}

/**
 * request sign, save headers
 * @param path
 * @param method
 * @param headers
 * @param query
 * @param body
 */
export async function getRequestSign(
  token: string,
  path: string,
  method: string,
  headers: { [k: string]: string } = {},
  query: { [k: string]: any } = {},
  body: { [k: string]: any } | "" = "",
  timestamp: number = Date.now()
) {
  const t = timestamp.toString();
  const [uri, pathQuery] = path.split("?");
  const queryMerged = Object.assign(query, qs.parse(pathQuery));
  const sortedQuery: { [k: string]: string } = {};
  Object.keys(queryMerged)
    .sort()
    .forEach((i) => (sortedQuery[i] = query[i]));

  const querystring = decodeURIComponent(qs.stringify(sortedQuery));
  const url = querystring ? `${uri}?${querystring}` : uri;
  const contentHash = createHash("sha256")
    .update(typeof body === "string" ? "" : JSON.stringify(body))
    .digest("hex");

  const stringToSign = [method, contentHash, "", url].join("\n");
  const signStr = config.tuya.accessKey + token + t + stringToSign;
  return {
    t,
    path: url,
    client_id: config.tuya.accessKey,
    sign: await encryptStr(signStr, config.tuya.secretKey),
    sign_method: "HMAC-SHA256",
    access_token: token,
  };
}

export { router };

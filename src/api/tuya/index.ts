import { createHmac, createHash } from "crypto";
import qs from "qs";
import config from "../../config";
import { getSignedPassword } from "./encriptation";

class InvalidRequestError extends Error {
  constructor(message: string, reason: "code" | "message" = "code") {
    super(message);
    this.name = "InvalidRequestError";
  }
}

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

async function getTokenSigned(clientId: string): Promise<Headers> {
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
 * HMAC-SHA256 crypto function
 */
async function encryptStr(str: string, secret: string): Promise<string> {
  return createHmac("sha256", secret)
    .update(str, "utf8")
    .digest("hex")
    .toUpperCase();
}

interface CreateTemporaryPasswordRes {
  code: number;
  success: boolean;
  t: number;
  msg: string;
  result: {
    id: number;
  };
}

export async function createDynamicKeyPassword(
  name: string,
  code: string,
  effective_time: number,
  invalid_time: number
): Promise<{ error: Error } | { password_id: string }> {
  try {
    const token = await getSignedToken();

    const ticket = await getPasswordTicket(token.result.access_token);

    const tempPassword = await createTemporaryPassword(
      token.result.access_token,
      ticket.result.ticket_id,
      ticket.result.ticket_key,
      name,
      effective_time,
      invalid_time,
      code
    );
    return { password_id: tempPassword.result.id.toString() };
  } catch (err: unknown) {
    if (typeof err === "string") {
      return { error: new Error(err) };
    }

    return { error: err as Error };
  }
}

async function createTemporaryPassword(
  token: string,
  ticket_id: string,
  ticketKey: string,
  name: string,
  effective_time: number = Date.now(),
  invalid_time: number = Date.now() + 360000,
  code: string = "1234567"
) {
  const signUrl = `/v1.0/devices/${config.tuya.deviceId}/door-lock/temp-password`;

  const password = getSignedPassword(code, ticketKey, config.tuya.secretKey);

  const body = {
    name,
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

  const passwordResult = (await data.json()) as CreateTemporaryPasswordRes;
  if (!passwordResult.success) {
    throw new InvalidRequestError("Failed to create password", "message");
  }

  return passwordResult;
}

/**
 * request sign, save headers
 * @param path
 * @param method
 * @param headers
 * @param query
 * @param body
 */
async function getRequestSign(
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

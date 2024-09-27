import { createHmac, createHash } from "crypto";
import config from "../../config.mjs";
import { getSignedPassword } from "./encriptation.mjs";
import { TuyaContext, TuyaResponse } from "@tuya/tuya-connector-nodejs";
export interface GetPasswordTicketRes {
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

interface GetPasswordTicket {
  expire_time: number;
  ticket_id: string;
  ticket_key: string;
}

export async function getPasswordTicket(
  tuyaContext: TuyaContext
): Promise<TuyaResponse<GetPasswordTicket>> {
  const tuyaRes = await tuyaContext.request<GetPasswordTicket>({
    method: "POST",
    path: `/v1.0/devices/${config.tuya.deviceId}/door-lock/password-ticket`,
    body: {},
  });

  return tuyaRes;
}

export async function createDynamicKeyPassword(
  name: string,
  code: string,
  effective_time: Date,
  invalid_time: Date
): Promise<{ error: Error } | { password_id: number }> {
  try {
    const context = new TuyaContext({
      baseUrl: config.tuya.host,
      accessKey: config.tuya.accessKey,
      secretKey: config.tuya.secretKey,
    });

    const ticket = await getPasswordTicket(context);

    if (!ticket.success) {
      return { error: new Error("Failed to create ticket") };
    }

    const password = await createTemporaryPasswordWithContext(
      ticket.result.ticket_id,
      ticket.result.ticket_key,
      name,
      effective_time,
      invalid_time,
      code,
      context
    );

    if (!password.success) {
      return { error: new Error("Failed to create password") };
    }

    return { password_id: password.result.id };
  } catch (err: unknown) {
    if (typeof err === "string") {
      return { error: new Error(err) };
    }

    return { error: err as Error };
  }
}

interface CreateTemporaryPasswod {
  id: number;
}

export async function createTemporaryPasswordWithContext(
  ticket_id: string,
  ticket_key: string,
  name: string,
  effective_time_date: Date,
  invalid_time_date: Date,
  code: string,
  tuyaContext: TuyaContext
): Promise<TuyaResponse<CreateTemporaryPasswod>> {
  const signUrl = `/v1.0/devices/${config.tuya.deviceId}/door-lock/temp-password`;
  const password = getSignedPassword(code, ticket_key, config.tuya.secretKey);

  // We transform the Date object in seconds
  const effective_time = effective_time_date.getTime() / 1000;
  const invalid_time = invalid_time_date.getTime() / 1000;

  const body = {
    name,
    password,
    effective_time,
    invalid_time,
    password_type: "ticket",
    ticket_id,
  };

  return await tuyaContext.request<CreateTemporaryPasswod>({
    method: "POST",
    path: signUrl,
    body,
  });
}

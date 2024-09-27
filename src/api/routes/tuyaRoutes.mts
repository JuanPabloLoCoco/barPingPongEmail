import { TuyaContext } from "@tuya/tuya-connector-nodejs";
import { Router } from "express";
import config from "../../config.mjs";
import {
  createTemporaryPasswordWithContext,
  GetPasswordTicketRes,
} from "../tuya/index.mjs";

const router = Router();

router.get("/tuya/ticket", async (req, res) => {
  const tuya = new TuyaContext({
    baseUrl: config.tuya.host,
    accessKey: config.tuya.accessKey,
    secretKey: config.tuya.secretKey,
  });

  const tuyaRes = await tuya.request({
    method: "POST",
    path: `/v1.0/devices/${config.tuya.deviceId}/door-lock/password-ticket`,
    body: {},
  });
  console.log(tuyaRes);

  const effective_time = new Date(new Date().getTime() + 60 * 1000);
  const invalid_time = new Date(effective_time.getTime() + 2 * 60 * 60 * 1000);

  const tuyaRes2 = await createTemporaryPasswordWithContext(
    (tuyaRes as GetPasswordTicketRes).result.ticket_id,
    (tuyaRes as GetPasswordTicketRes).result.ticket_key,
    "test 3",
    effective_time,
    invalid_time,
    "1234567",
    tuya
  );
  return res.send(tuyaRes2);
});

export { router };

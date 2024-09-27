import dotenv from "dotenv";

dotenv.config();

interface Config {
  tuya: {
    host: string;
    accessKey: string;
    secretKey: string;
    deviceId: string;
  };
  twilio: {
    accountSid: string;
    accessToken: string;
  };
  firebase: {
    databaseUrl: string;
  };
}

const config: Config = {
  tuya: {
    /* openapi host */
    host: process.env.TUYA_HOST || "https://openapi-ueaz.tuyaus.com",
    /* fetch from openapi platform */
    accessKey: process.env.TUYA_ACCESS_KEY || "",
    /* fetch from openapi platform */
    secretKey: process.env.TUYA_SECRET_KEY || "",
    /* Interface example device_ID */
    deviceId: process.env.TUYA_DEVICE_ID || "",
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || "",
    accessToken: process.env.TWILIO_ACCESS_TOKEN || "",
  },
  firebase: {
    databaseUrl: process.env.FIREBASE_DATABASE_URL || "",
  },
};

export default config;

declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    DB_HOST: string;
    DB_USER: string;
    DB_PASS: string;
    // Add other environment variables here
    TUYA_DEVICE_ID: string;
    TUYA_HOST: string;
    TUYA_ACCESS_KEY: string;
    TUYA_SECRET_KEY: string;
  }
}

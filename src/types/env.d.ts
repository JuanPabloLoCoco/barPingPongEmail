declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    DB_HOST: string;
    DB_USER: string;
    DB_PASS: string;
    // Add other environment variables here
    EMAIL_USER: string;
    EMAIL_PASS: string;
    EMAIL_HOST: string;
    EMAIL_PORT: number;
    EMAIL_TLS: boolean;
    EMAIL_TO: number;
  }
}

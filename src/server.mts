import express from "express";
// import nodemailer from "nodemailer";
import cors from "cors";
import { authMiddleware } from "./api/middleware/auth.mjs";
import { router as homeRoutes } from "./api/routes/home.mjs";
import { router as authRoutes } from "./api/routes/authRoutes.mjs";
import { router as tuyaRoutes } from "./api/routes/tuyaRoutes.mjs";
import { ReservationService } from "./api/services/ReservationService.mjs";
import config from "./config.mjs";
import { SMSServiceImpl } from "./api/services/SMSService.mjs";
import { FirebaseRepository } from "./api/repositories/FirebaseRepository.mjs";

const app = express();

if (!config.tuya.accessKey || !config.tuya.secretKey) {
  throw new Error("Tuya access key and secret key are required.");
}

app.use(cors({ origin: true }));
app.use(express.json());

// for parsing application/xwww-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// gmail auth routes
app.use("", authRoutes);
app.use("", tuyaRoutes);
app.use("", homeRoutes);

// auth middleware for api route
app.use(authMiddleware);

const port = process.env.PORT || 8900;

const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


const firebaseRepository = new FirebaseRepository(config.firebase.databaseUrl);
await firebaseRepository.configure();

const twilioService = new SMSServiceImpl(
  "+19546378467",
  config.twilio.accessToken,
  config.twilio.accountSid
);

const reservationService = new ReservationService(
  firebaseRepository,
  twilioService
);

const interval = setInterval(() => reservationService.readEmails(), 120 * 1000);

server.on("close", () => {
  clearInterval(interval);
  server.close();
});

export { app };

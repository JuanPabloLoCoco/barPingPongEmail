import express from "express";
// import nodemailer from "nodemailer";
import cors from "cors";
import { authMiddleware } from "./api/middleware/auth.mjs";
import { router as authRoutes } from "./api/routes/authRoutes.mjs";
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

// auth middleware for api route
app.use(authMiddleware);

const port = 8900; //process.env.PORT || 8900;

const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

const firebaseRepository = new FirebaseRepository(config.firebase.databaseUrl);
firebaseRepository.configure();
const twilioService = new SMSServiceImpl(
  "+5491158767333",
  config.twilio.accessToken,
  config.twilio.accountSid
);
const reservationService = new ReservationService(
  firebaseRepository,
  twilioService
);

const interval = setInterval(() => reservationService.readEmails(), 30 * 1000);

server.on("close", () => {
  clearInterval(interval);
  server.close();
});

export { app };

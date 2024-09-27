import express from "express";
// import nodemailer from "nodemailer";
import cors from "cors";
import { authMiddleware } from "./api/middleware/auth.mjs";
import { router as authRoutes } from "./api/routes/authRoutes.mjs";
import { ReservationService } from "./api/services/ReservationService.mjs";
import { LocalReservationRepository } from "./api/repositories/LocalRepository.mjs";
import config from "./config.mjs";
import { SMSServiceImpl } from "./api/services/SMSService.mjs";

const app = express();

if (!config.tuya.accessKey || !config.tuya.secretKey) {
  throw new Error("Tuya access key and secret key are required.");
}

app.use(cors({ origin: true }));
app.use(express.json());

// for parsing application/xwww-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// gmail auth routes
app.use("/", authRoutes);

// auth middleware for api routes
app.use(authMiddleware);

const port = 8900; //process.env.PORT || 8900;

// export async function sendEmail(
//   to: string,
//   subject: string,
//   text: string
// ): Promise<void> {
//   // Create a transporter object using SMTP transport
//   const transporter = nodemailer.createTransport({
//     host: "smtp.example.com", // Replace with your SMTP server host
//     port: 587, // Replace with your SMTP server port
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: "your-email@example.com", // Replace with your email
//       pass: "your-email-password", // Replace with your email password
//     },
//   });

//   // Define the email options
//   const mailOptions = {
//     from: "your-email@example.com", // Replace with your email
//     to,
//     subject,
//     text,
//   };

//   // Send the email
//   await transporter.sendMail(mailOptions);
// }

// app.get("/reademails", async (req, res) => {
//   // await readEmails();
//   res.send("Emails have been read and logged to the console.");
// });

const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

const localRepository = new LocalReservationRepository();
const twilioService = new SMSServiceImpl(
  "+5491158767333",
  config.twilio.accessToken,
  config.twilio.accountSid
);
const reservationService = new ReservationService(
  localRepository,
  twilioService
);

const interval = setInterval(() => reservationService.readEmails(), 30 * 1000);

server.on("close", () => {
  clearInterval(interval);
  server.close();
});

export { app };

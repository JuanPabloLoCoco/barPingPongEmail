import express, { Request, Response } from "express";
import next from "next";

import { router as messagesRoutes } from "./api/routes/messagesRoutes";
import { LocalReservationRepository } from "./api/repositories/LocalRepository";
import { ReservationService } from "./api/services/ReservationService";
import {
  authorize,
  getNewToken,
  getOAuth2Client,
  saveToken,
} from "./api/gmail/auth";
import { SMSServiceImpl } from "./api/services/SMSService";
import config from "./config";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 8900;

app.prepare().then(() => {
  const server = express();

  // Custom Express route
  server.get("/api/hello", (req: Request, res: Response) => {
    res.json({ message: "Hello from the custom Express server!" });
  });

  /**
   * Route for authtenticate user, otherwise request a new token
   * prompting for user authorization
   */
  server.get("/gmail/auth", async (req: Request, res: Response) => {
    try {
      const authenticated = await authorize();

      // if not authenticated, request new token
      if (!authenticated) {
        const authorizeUrl = await getNewToken();
        return res.send(
          `<script>window.open("${authorizeUrl}", "_blank");</script>`
        );
      }

      return res.send({ text: "Authenticated" });
    } catch (e) {
      return res.send({ error: e });
    }
  });

  /**
   * Callback route after authorizing the app
   * Receives the code for claiming new token
   */
  server.get("/oauth2Callback", async (req: Request, res: Response) => {
    try {
      // get authorization code from request
      const code = req.query.code as string;

      const oAuth2Client = getOAuth2Client();
      const result = await oAuth2Client.getToken(code);
      const tokens = result.tokens;

      await saveToken(tokens);

      console.log("Successfully authorized");
      return res.send("<script>window.close();</script>");
    } catch (e) {
      return res.send({ error: e });
    }
  });

  server.use("/api/messages", messagesRoutes);

  // Handle all other routes with Next.js
  server.all("*", (req: Request, res: Response) => {
    return handle(req, res);
  });

  server.listen(port, (err?: any) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);

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

    const interval = setInterval(
      () => reservationService.readEmails(),
      30 * 1000
    );
  });
});

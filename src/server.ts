import express, { Request, Response } from "express";
import next from "next";

import { router as authRoutes } from "./api/routes/authRoutes";
import { router as messagesRoutes } from "./api/routes/messagesRoutes";
import { LocalReservationRepository } from "./api/repositories/LocalRepository";
import { ReservationService } from "./api/services/ReservationService";

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

  server.use("/api/gmail", authRoutes);
  server.use("/api/messages", messagesRoutes);

  // Handle all other routes with Next.js
  server.all("*", (req: Request, res: Response) => {
    return handle(req, res);
  });

  server.listen(port, (err?: any) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);

    const localRepository = new LocalReservationRepository();
    const reservationService = new ReservationService(localRepository);

    const interval = setInterval(
      () => reservationService.readEmails(),
      30 * 1000
    );
  });
});

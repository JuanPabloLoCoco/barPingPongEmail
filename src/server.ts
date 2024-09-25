import express, { Request, Response } from "express";
import next from "next";

import { router as authRoutes } from "./api/routes/authRoutes";

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

  // Handle all other routes with Next.js
  server.all("*", (req: Request, res: Response) => {
    return handle(req, res);
  });

  server.listen(port, (err?: any) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});

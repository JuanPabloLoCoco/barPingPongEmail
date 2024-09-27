import { Request, Response, Router } from "express";
import {
  authorize,
  getNewToken,
  getOAuth2Client,
  saveToken,
} from "../gmail/auth.mjs";

const router = Router();
/**
 * Route for authtenticate user, otherwise request a new token
 * prompting for user authorization
 */
router.get("/auth", async (req: Request, res: Response) => {
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
router.get("/oauth2Callback", async (req: Request, res: Response) => {
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

export { router };

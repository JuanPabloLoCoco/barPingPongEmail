import { Router, Request, Response } from "express";
import * as gmail from "../functions/gmail-api";
import { emailParsing, EventType } from "../emailParsing";

const router = Router();

router.get("/getMessages", async (req: Request, res: Response) => {
  try {
    const messages = await gmail.getMessages();

    const listOfOrders: EventType[] = [];
    for (const message of messages) {
      const html = message.html;
      if (html) {
        try {
          const evt = emailParsing(html, new Date());
          if (evt) {
            listOfOrders.push(evt);
          }
        } catch (err) {
          continue;
        }
      }
    }

    return res.send({ events: listOfOrders });
  } catch (e) {
    console.error(e);
    return res.send({ error: e });
  }
});
export { router };

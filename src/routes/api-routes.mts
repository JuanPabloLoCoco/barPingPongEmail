import { Router, Request, Response } from "express";
import * as gmail from "../functions/gmail-api.mjs";
import { emailParsing, EventType } from "../emailParsing.mjs";
import { EmailAddress } from "mailparser";

const router = Router();

router.get("/getMessages", async (req: Request, res: Response) => {
  try {
    const listOfOrders = await proccessMessages();

    return res.send({ events: listOfOrders });
  } catch (e) {
    console.error(e);
    return res.send({ error: e });
  }
});

export async function proccessMessages(): Promise<EventType[]> {
  const messages = await gmail.getMessages();

  const listOfOrders: EventType[] = [];
  for (const message of messages) {
    const html = message.html;
    if (!html) {
      continue;
    }
    try {
      const fromAddress = message.from?.value || [];
      const validAddress = [
        "palitolococo@gmail.com",
        "noreply@alquilatucancha.com",
      ];
      const hasValidAddress = fromAddress.some(
        (x: EmailAddress) =>
          x.address === validAddress[0] || x.address === validAddress[1]
      );
      if (!hasValidAddress) {
        continue;
      }

      const evt = emailParsing(html, new Date());
      if (evt) {
        listOfOrders.push(evt);
        await gmail.markAsRead(message.messageId!);
      }
    } catch (err) {
      continue;
    }
  }

  return listOfOrders;
}

export { router };

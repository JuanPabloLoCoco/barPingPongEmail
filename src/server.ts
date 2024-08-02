import express from "express";
import { ImapSimple, connect } from "imap-simple";
import nodemailer from "nodemailer";
import { simpleParser } from "mailparser";

const app = express();
const port = 8900;

const imapConfig = {
  imap: {
    user: "your-email@example.com",
    password: "your-password",
    host: "imap.example.com",
    port: 993,
    tls: true,
    authTimeout: 3000,
  },
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@example.com",
    pass: "your-password",
  },
});

export async function readEmails() {
  try {
    console.log("Read email");
    const connection: ImapSimple = await connect(imapConfig);
    await connection.openBox("INBOX");

    const searchCriteria = ["UNSEEN"];
    const fetchOptions = {
      bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
      struct: true,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    for (const message of messages) {
      const all = message.parts.find((part) => part.which === "TEXT");
      const id = message.attributes.uid;
      const idHeader = "Imap-Id: " + id + "\r\n";

      if (all) {
        const parsed = await simpleParser(idHeader + all.body);
        console.log(parsed.subject);
        console.log(parsed.from?.text);
        console.log(parsed.text);
      }
    }

    connection.end();
  } catch (err) {
    console.error(err);
  }
}

export async function sendEmail(
  to: string,
  subject: string,
  text: string
): Promise<void> {
  // Create a transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    host: "smtp.example.com", // Replace with your SMTP server host
    port: 587, // Replace with your SMTP server port
    secure: false, // true for 465, false for other ports
    auth: {
      user: "your-email@example.com", // Replace with your email
      pass: "your-email-password", // Replace with your email password
    },
  });

  // Define the email options
  const mailOptions = {
    from: "your-email@example.com", // Replace with your email
    to,
    subject,
    text,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
}

app.get("/", async (req, res) => {
  await readEmails();
  res.send("Emails have been read and logged to the console.");
});

if (require.main === module) {
  const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });

  const interval = setInterval(readEmails, 30 * 1000);

  server.on("close", () => {
    clearInterval(interval);
    server.close();
  });
}

export { app };

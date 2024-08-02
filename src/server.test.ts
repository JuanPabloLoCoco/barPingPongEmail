import { mocked } from "jest-mock";
import { ImapSimple, connect } from "imap-simple";
import nodemailer from "nodemailer";
import { simpleParser } from "mailparser";
import request from "supertest";
import { app, sendEmail } from "./server"; // Adjust the import path as necessary
import { Server } from "http";

jest.mock("imap-simple");
jest.mock("nodemailer");
jest.mock("mailparser");

interface ParsedEmail {
  subject: string;
  from: {
    text: string;
  };
  text: string;
}

let server: Server;

beforeAll((done) => {
  server = app.listen(3000, () => {
    console.log("Test server running on port 3000");
    done();
  });
});

afterAll((done) => {
  server.close(() => {
    console.log("Test server closed");
    done();
  });
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe("Email reading and sending", () => {
  it("should read emails and log them", async () => {
    const mockConnect = mocked(connect);
    const mockSimpleParser = mocked(simpleParser);

    // Mock the IMAP connection and email fetching
    mockConnect.mockResolvedValue({
      openBox: jest.fn().mockResolvedValue(null),
      search: jest.fn().mockResolvedValue([
        {
          parts: [{ which: "TEXT", body: "Test email body" }],
          attributes: { uid: 123 },
        },
      ]),
      end: jest.fn(),
    } as unknown as ImapSimple);

    // Mock the email parsing
    mockSimpleParser.mockResolvedValue({
      subject: "Test Subject",
      from: {
        text: "test@example.com",
        value: [
          {
            name: "test",
            address: "test@example.com",
          },
        ],
        html: "",
      },
      text: "Test email body",
      attachments: [],
      // @ts-expect-error
      headers: undefined,
      headerLines: [],
      html: "",
    });

    const response = await request(app).get("/");
    expect(response.text).toBe(
      "Emails have been read and logged to the console."
    );
    expect(mockConnect).toHaveBeenCalled();
    expect(mockSimpleParser).toHaveBeenCalled();
  });

  it("should send an email and verify its content when read", async () => {
    const mockConnect = mocked(connect);
    const mockSimpleParser = mocked(simpleParser);
    const mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: "test-message-id" }),
    };

    // Mock the IMAP connection and email fetching
    mockConnect.mockResolvedValue({
      openBox: jest.fn().mockResolvedValue(null),
      search: jest.fn().mockResolvedValue([
        {
          parts: [{ which: "TEXT", body: "Test email body" }],
          attributes: { uid: 123 },
        },
      ]),
      end: jest.fn(),
    } as unknown as ImapSimple);

    // Mock the email parsing
    mockSimpleParser.mockResolvedValue({
      subject: "Test Subject",
      from: {
        text: "test@example.com",
        value: [
          {
            name: "test",
            address: "test@example.com",
          },
        ],
        html: "",
      },
      text: "Test email body",
      attachments: [],
      headers: new Map(),
      headerLines: [],
      html: "",
    });

    // Mock the nodemailer transporter
    jest
      .spyOn(nodemailer, "createTransport")
      .mockReturnValue(mockTransporter as any);

    // Send an email
    await sendEmail("test@example.com", "Test Subject", "Test email body");

    // Verify that the email was sent
    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
      from: "your-email@example.com",
      to: "test@example.com",
      subject: "Test Subject",
      text: "Test email body",
    });

    // Read the emails
    const response = await request(app).get("/");
    expect(response.text).toBe(
      "Emails have been read and logged to the console."
    );
    expect(mockConnect).toHaveBeenCalled();
    expect(mockSimpleParser).toHaveBeenCalled();

    // Verify the email content
    const parsedEmail = (await mockSimpleParser.mock.results[0]
      .value) as ParsedEmail;
    expect(parsedEmail.subject).toBe("Test Subject");
    expect(parsedEmail.from.text).toBe("test@example.com");
    expect(parsedEmail.text).toBe("Test email body");
  });
});

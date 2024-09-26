import twilio from "twilio";

export interface SMSService {
  sendMessage(to: string, message: string): Promise<string | undefined>;
}

export class SMSServiceImpl implements SMSService {
  phoneNumber: string;
  accessToken: string;
  accountSid: string;
  constructor(phoneNumber: string, accessToken: string, accountSid: string) {
    this.phoneNumber = phoneNumber;
    this.accessToken = accessToken;
    this.accountSid = accountSid;
  }

  async sendMessage(to: string, message: string): Promise<string | undefined> {
    const twilioClient = twilio(this.accountSid, this.accessToken);

    try {
      const messageResponse = await twilioClient.messages.create({
        body: message,
        from: this.phoneNumber,
        to,
      });
      console.log("Message sent successfully:", messageResponse.sid);
      return undefined;
    } catch (error) {
      console.error("Failed to send message:", error);
      return "Failed to send message";
    }
  }
}

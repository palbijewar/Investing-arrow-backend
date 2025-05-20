import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendWelcomeEmail(to: string, username: string, sponsor_id: string) {
    const mailOptions = {
      from: '<investingarrowbot@gmail.com>',
      to,
      subject: "Welcome to the Platform!",
      html: `
  <h3>Hi ${username},</h3>
  <p>Welcome to Investing Arrow!</p>
  <p>Your account has been created successfully.</p>
  <p>Your Sposor ID is ${sponsor_id}</p>
  <p>You're all set to explore the platform.</p>
  <p>Best,<br>Team Investing Arrow</p>
`,
      text: `Hi ${username},\nWelcome to Investing Arrow!\nYour account has been created.\n\nTeam Investing Arrow`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
    }
  }
}

import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Load from environment variables
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendConfirmationEmail(email: string, token: string, language: string) {
    const confirmationUrl = `http://localhost:3000/auth/register/verify?token=${token}`;
    const from = `TirePro <${process.env.EMAIL_USER}>`;

    const mailOptions =
      language === 'en'
        ? {
            from,
            to: email,
            subject: 'Verify your TirePro account',
            html: `
              <h2>Welcome to TirePro!</h2>
              <p>Please confirm your email address by clicking the link below. If you did not request this, you can ignore it:</p>
              <a href="${confirmationUrl}">Verify Email</a>
              <p>This link will expire in 24 hours.</p>
            `,
          }
        : {
            from,
            to: email,
            subject: 'Verifica tu cuenta de TirePro',
            html: `
              <h2>¡Bienvenido a TirePro!</h2>
              <p>Haz clic en el siguiente enlace para confirmar tu correo. Si no lo solicitaste, puedes ignorarlo:</p>
              <a href="${confirmationUrl}">Verificar</a>
              <p>Este enlace expirará en 24 horas.</p>
            `,
          };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Confirmation email sent:', info.response);
    } catch (error) {
      console.error('❌ Failed to send confirmation email:', error);
    }
  }

  async sendWelcomeEmail(email: string, language: string) {
    const from = `TirePro <${process.env.EMAIL_USER}>`;

    const mailOptions =
      language === 'en'
        ? {
            from,
            to: email,
            subject: 'Welcome to TirePro!',
            html: `
              <h1>Welcome to TirePro!</h1>
              <p>We're excited to have you on board. Here are a few things you can do next:</p>
              <ul>
                <li>Register your vehicles</li>
                <li>Start adding tire inspections</li>
                <li>Track CPK and wear rates</li>
              </ul>
              <p>Happy tracking! 🚛</p>
            `,
          }
        : {
            from,
            to: email,
            subject: '¡Bienvenido a TirePro!',
            html: `
              <h1>¡Bienvenido a TirePro!</h1>
              <p>Estamos felices de tenerte a bordo. Aquí tienes algunas cosas que puedes hacer:</p>
              <ul>
                <li>Registrar tus vehículos</li>
                <li>Comenzar a agregar inspecciones de llantas</li>
                <li>Monitorear el CPK y desgaste</li>
              </ul>
              <p>¡A rodar se dijo! 🛞</p>
            `,
          };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent:', info.response);
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
    }
  }
}
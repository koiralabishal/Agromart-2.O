import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Enhanced Mailer with Connection Pooling
 * Pooling keeps the connection to the SMTP server alive, reducing handshake overhead
 * and significantly improving delivery speed for subsequent emails.
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true, // Enable connection pooling
  maxConnections: 5,
  maxMessages: 100,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('>>> [Mailer] Config Error:', error);
  } else {
    console.log('>>> [Mailer] Ready for messages');
  }
});

/**
 * Base send mail function
 */
export const sendMail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"AgroMart" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    return info;
  } catch (error) {
    console.error('>>> [Mailer] Send Failed:', error);
    throw error;
  }
};

export default transporter;

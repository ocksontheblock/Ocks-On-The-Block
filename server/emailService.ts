import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';

// Configure email transporter (using SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // Email address
    pass: process.env.SMTP_PASS, // App password or email password
  },
});

// Email templates
const getWelcomeEmailTemplate = (email: string, unsubscribeUrl: string) => {
  return {
    subject: 'Welcome to Ocks on the Block - You\'re In! 🔥',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Ocks on the Block</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #ff6600, #ff4500);
            color: white;
            border-radius: 8px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .content {
            margin-bottom: 30px;
          }
          .content h2 {
            color: #ff6600;
            font-size: 20px;
          }
          .benefits {
            background: #f8f8f8;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .benefits ul {
            margin: 0;
            padding-left: 20px;
          }
          .benefits li {
            margin: 8px 0;
          }
          .cta {
            text-align: center;
            margin: 30px 0;
          }
          .cta a {
            display: inline-block;
            background: #ff6600;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
          }
          .unsubscribe {
            margin-top: 20px;
            font-size: 11px;
            color: #999;
          }
          .unsubscribe a {
            color: #999;
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>OCKS ON THE BLOCK</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Welcome to the Block! 🔥</p>
          </div>
          
          <div class="content">
            <h2>You're officially locked in!</h2>
            <p>Welcome to Ocks on the Block, where NYC corner store culture meets legendary collectibles. You're now part of our exclusive community and you'll be the first to know about:</p>
            
            <div class="benefits">
              <ul>
                <li><strong>🚨 First Drop Alerts</strong> - Get early access before anyone else</li>
                <li><strong>💎 Limited Edition Releases</strong> - Exclusive Ocks you can't get anywhere else</li>
                <li><strong>🏆 Scavenger Hunt Updates</strong> - $10,000 prize announcements and hints</li>
                <li><strong>🔥 Special Promotions</strong> - Member-only discounts and offers</li>
              </ul>
            </div>
            
            <p>Ready to start collecting? Check out our Mystery Boxes and get your shot at rare Ocks, legendary pulls, and a chance at the $10,000 grand prize.</p>
            
            <div class="cta">
              <a href="${process.env.FRONTEND_URL || 'https://your-domain.com'}/buy-ocks">Shop Mystery Boxes Now</a>
            </div>
            
            <p>Keep your eyes peeled for our next drop - you won't want to miss it!</p>
            
            <p style="margin-top: 25px;">
              <strong>Stay fresh,<br>
              The Ocks on the Block Team</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Ocks on the Block. All rights reserved.</p>
            <p>Rep Your Ock. Wear Your Block.</p>
            <div class="unsubscribe">
              <p>You're receiving this because you signed up for alerts at ${email}</p>
              <p><a href="${unsubscribeUrl}">Unsubscribe</a> | Update your preferences</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to Ocks on the Block!

You're officially locked in! Welcome to Ocks on the Block, where NYC corner store culture meets legendary collectibles.

You're now part of our exclusive community and you'll be the first to know about:
• First Drop Alerts - Get early access before anyone else
• Limited Edition Releases - Exclusive Ocks you can't get anywhere else  
• Scavenger Hunt Updates - $10,000 prize announcements and hints
• Special Promotions - Member-only discounts and offers

Ready to start collecting? Check out our Mystery Boxes at ${process.env.FRONTEND_URL || 'https://your-domain.com'}/buy-ocks

Keep your eyes peeled for our next drop - you won't want to miss it!

Stay fresh,
The Ocks on the Block Team

---
© ${new Date().getFullYear()} Ocks on the Block. All rights reserved.
Rep Your Ock. Wear Your Block.

You're receiving this because you signed up for alerts at ${email}
Unsubscribe: ${unsubscribeUrl}
    `
  };
};

// Send welcome email
export async function sendWelcomeEmail(email: string, signupId: number) {
  try {
    const unsubscribeUrl = `${process.env.FRONTEND_URL || 'https://your-domain.com'}/unsubscribe?token=${Buffer.from(`${signupId}:${email}`).toString('base64')}`;
    
    const emailTemplate = getWelcomeEmailTemplate(email, unsubscribeUrl);
    
    await transporter.sendMail({
      from: `"Ocks on the Block" <${process.env.SMTP_USER}>`,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });
    
    console.log(`Welcome email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

// Verify email configuration
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('Email server is ready to send emails');
    return true;
  } catch (error) {
    console.error('Email server verification failed:', error);
    return false;
  }
}

export { transporter };
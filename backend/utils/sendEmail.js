import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  let transporter;

  // Check if SMTP environment variables are configured
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    // Standard SMTP transporter configuration
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // FALLBACK: Auto-generate test SMTP account using Ethereal Email
    console.log('[Email Utility] SMTP credentials not set in .env. Generating Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }

  const mailOptions = {
    from: `"PulseCare AI" <${process.env.FROM_EMAIL || 'noreply@pulsecare.ai'}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  const info = await transporter.sendMail(mailOptions);
  
  console.log(`[Email Utility] Message sent: ${info.messageId}`);
  
  // If using Ethereal fallback, extract the URL to inspect the inbox online
  if (!process.env.SMTP_HOST) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[Email Utility] Ethereal Preview URL: ${previewUrl}`);
    info.previewUrl = previewUrl;
  }

  return info;
};

export default sendEmail;

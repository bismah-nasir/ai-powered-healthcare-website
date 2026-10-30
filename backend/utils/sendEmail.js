import nodemailer from 'nodemailer';

const SMTP_VARS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];

const sendEmail = async (options) => {
  let transporter;

  // Check if SMTP environment variables are configured
  const missingVars = SMTP_VARS.filter((name) => !process.env[name]);
  const useSmtp = missingVars.length === 0;

  if (useSmtp) {
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
    // A partial setup would otherwise fall back silently, so name what is missing
    if (missingVars.length < SMTP_VARS.length) {
      console.warn(`[Email Utility] Incomplete SMTP config, missing: ${missingVars.join(', ')}. Falling back to Ethereal.`);
    } else {
      console.log('[Email Utility] SMTP credentials not set in .env. Generating Ethereal test account...');
    }
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
  if (!useSmtp) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[Email Utility] Ethereal Preview URL: ${previewUrl}`);
    info.previewUrl = previewUrl;
  }

  return info;
};

export default sendEmail;

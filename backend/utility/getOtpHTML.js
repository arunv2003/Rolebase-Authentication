const getEmailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Email</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a202c;
      background-color: #f7fafc;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      padding: 40px 20px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 40px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .message {
      font-size: 16px;
      color: #4a5568;
      margin-bottom: 32px;
    }
    .otp-container {
      background: #f8fafc;
      border: 2px dashed #e2e8f0;
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      margin: 32px 0;
    }
    .otp-code {
      font-family: 'Courier New', monospace;
      font-size: 36px;
      font-weight: 800;
      color: #4f46e5;
      letter-spacing: 8px;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      background: #4f46e5;
      color: #ffffff !important;
      padding: 16px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      display: inline-block;
      transition: background 0.2s;
    }
    .footer {
      padding: 32px;
      text-align: center;
      font-size: 14px;
      color: #718096;
      background: #f8fafc;
      border-top: 1px solid #edf2f7;
    }
    .disclaimer {
      font-size: 12px;
      color: #a0aec0;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Email Verification</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || "Your Company"}. All rights reserved.</p>
      <p class="disclaimer">If you didn't request this email, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>
`;

export const getOTPHTML = ({ name, email ,otp }) => {
  const content = `
    <p class="greeting">Hello ${name},</p>
    <p class="message">Verify your account using the security code below. This code is valid for 5 minutes.</p>
    <div class="otp-container">
      <div class="otp-code">${otp}</div>
    </div>
    <p class="message">For your security, please do not share this code with anyone.</p>
  `;
  return getEmailTemplate(content);
};

export const getVerificationEmailHTML = ({ name, verifyToken, isBackendLink = false }) => {
  const frontendURL = process.env.ALLOWED_ORIGINS?.split(',')[0] || "http://localhost:3000";
  const backendURL = `http://localhost:${process.env.PORT || 8000}`;
  
  const verificationLink = isBackendLink 
    ? `${backendURL}/user/verify-email?token=${verifyToken}`
    : `${frontendURL}/verify-email?token=${verifyToken}`;
  
  const content = `
    <p class="greeting">Hello ${name},</p>
    <p class="message">Thank you for joining us! Please verify your email address to get started. This link will expire in 5 minutes.</p>
    <div class="button-container">
      <a href="${verificationLink}" class="button">Verify Email Address</a>
    </div>
    <p class="message">Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; font-size: 12px; color: #718096;">${verificationLink}</p>
  `;
  return getEmailTemplate(content);
};

import { redisClient } from "../app.js";
import { User } from "../models/user/user.model.js";
import ApiError from "../utility/apiError.js";
import { ApiResponse } from "../utility/apiResponse.js";
import { asyncHandler } from "../utility/tryCatch.js";
import sanitize from "mongo-sanitize";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { sendMail } from "../utility/sendMail.js";
import { getOTPHTML, getVerificationEmailHTML } from "../utility/getOtpHTML.js";
import {
  generateAccessToken,
  generateToken,
  revokeRefreshToken,
  verifyRefreshToken,
} from "../utility/generateToken.js";
import { rotateCSRFToken } from "../middlewares/csrfToken.js";

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) throw new ApiError(400, "Verification token is required");

  const verifyKey = `verify:${token}`;
  const pendingUserData = await redisClient.get(verifyKey);

  if (!pendingUserData) {
    throw new ApiError(400, "Verification link has expired or is invalid");
  }

  const { name, email, password } = pendingUserData;

  // Check if user already exists (as a safety measure)
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    await redisClient.del(verifyKey); // Clean up
    throw new ApiError(400, "User already exists and is verified");
  }

  // Create the user in MongoDB
  const user = await User.create({
    name,
    email,
    password,
  });

  // Delete the token from Redis
  await redisClient.del(verifyKey);

  // Return a simple success message (or a professional HTML page)
  res.status(201).send(`
    <div style="font-family: sans-serif; text-align: center; margin-top: 100px;">
      <h1 style="color: #4f46e5;">Email Verified Successfully!</h1>
      <p>You can now log in to your account.</p>
    </div>
  `);
});

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = sanitize(req.body);

  if (!name) throw new ApiError(400, "Name is required");
  if (!email) throw new ApiError(400, "Email is required");
  if (!password) throw new ApiError(400, "Password is required");

  // Password validation: Start with capital letter, at least one number, and one special character
  const passwordRegex = /^[A-Z](?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/;
  if (!passwordRegex.test(password)) {
    const error = new Error("Validation Error");
    error.name = "ValidationError";
    error.errors = {
      password: {
        message:
          "Password must start with a capital letter, include at least one number and one special character",
      },
    };
    throw error;
  }

  // Rate limit check
  const rateLimitKey = `rateLimit:${req.ip}:${email}`;
  const [isRateLimited, existingUser] = await Promise.all([
    redisClient.get(rateLimitKey),
    User.findOne({ email }),
  ]);

  if (isRateLimited) {
    throw new ApiError(429, "Too many requests, try again later");
  }

  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  // Generate verification token and store pending user in Redis
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const verifyToken = crypto.randomBytes(32).toString("hex");
  const verifyKey = `verify:${verifyToken}`;
  const datatoStore = { name, email, password: hashedPassword };

  // Store in Redis for 5 minutes
  await redisClient.set(verifyKey, datatoStore, { ex: 300 });

  // Send verification email
  const subject = "Verify your email address";
  const html = getVerificationEmailHTML({
    name,
    email,
    verifyToken,
    isBackendLink: true,
  });

  await sendMail(email, subject, html);

  // Set rate limit for 60 seconds after successful email dispatch
  await redisClient.set(rateLimitKey, "true", { ex: 60 });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "A verification link has been sent to your email. It will be valid for 5 minutes.",
        { email },
      ),
    );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = sanitize(req.body);
  if (!email) throw new ApiError(400, "Email is required");
  if (!password) throw new ApiError(400, "Password is required");

  // Rate limit check for login attempts
  const loginRateLimitKey = `loginRateLimit:${req.ip}:${email}`;
  const isLoginRateLimited = await redisClient.get(loginRateLimitKey);
  if (isLoginRateLimited) {
    throw new ApiError(429, "Too many login attempts, try again later");
  }

  // Check if user exists and is verified
  const user = await User.findOne({ email });
  if (!user) {
    await redisClient.set(loginRateLimitKey, "true", { ex: 300 }); // 5 minutes lockout
    throw new ApiError(400, "Invalid credentials");
  }

  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    throw new ApiError(400, "Invalid credentials");
  }

  // Generate OTP

  const otpGenerated = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP in Redis with a short expiration time (e.g., 5 minutes)
  const otpKey = `otp:${email}`;
  await redisClient.set(otpKey, otpGenerated, { ex: 300 }); // OTP valid for 5 minutes

  // Send OTP email
  const subject = "Your OTP for Login";
  const html = getOTPHTML({
    name: user.name,
    email: user.email,
    otp: otpGenerated,
  });

  await sendMail(email, subject, html);

  // Set rate limit for login attempts after sending OTP

  await redisClient.set(loginRateLimitKey, "true", { ex: 60 }); // 1 minute lockout after sending OTP

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `An OTP has been sent to your email ${user.email}. It will be valid for 5 minutes.`,
      ),
    );
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = sanitize(req.body);
  if (!email) throw new ApiError(400, "Email is required");
  if (!otp) throw new ApiError(400, "OTP is required");

  const otpKey = `otp:${email}`;
  const storedOTP = await redisClient.get(otpKey);
  console.log("Stored OTP:", storedOTP); // Debugging log
  if (!storedOTP) {
    throw new ApiError(400, "OTP has expired or is invalid");
  }

  console.log(`Stored OTP: "${storedOTP}" (Type: ${typeof storedOTP})`);
  console.log(`Received OTP: "${otp}" (Type: ${typeof otp})`);

  if (storedOTP.toString().trim() !== otp.toString().trim()) {
    throw new ApiError(400, "Invalid OTP");
  }

  // OTP is valid, delete it from Redis
  await redisClient.del(otpKey);

  // Generate a session token or JWT for the user (not implemented here)
  // const token = generateToken(user);

  let user = await User.findOne({ email });

  const tokenData = await generateToken({
    userId: user._id,
    email: user.email,
    res,
  });

  res.status(200).json(
    new ApiResponse(200, "OTP verified successfully", {
      token: tokenData.accessToken,

      sessionInfo: {
        sessionId: tokenData.sessionId,
        loginTime: new Date().toISOString(),
        csrfToken: tokenData.csrfToken,
      },
    }),
  );
});

export const myProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const sessionId = req.sessionId;
  const sessionData = await redisClient.get(`active_session_data:${sessionId}`);

  let sessionInfo = null;

  if (sessionData) {
    const sessionParse =
      typeof sessionData === "string" ? JSON.parse(sessionData) : sessionData;
    sessionInfo = {
      sessionId,
      loginTime: sessionParse.createdAt,
    };
  }

  return res.status(200).json(
    new ApiResponse(200, "User Fetch Successfully", {
      user,
      sessionInfo,
    }),
  );
});

export const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res
      .status(401)
      .json(new ApiResponse(400, null, "invalid Refresh Token"));
  }

  const decodeData = await verifyRefreshToken(refreshToken);
  if (!decodeData) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Invalid Refresh Token"));
  }

  const tokenData = await generateAccessToken({
    userId: decodeData.userId,
    email: decodeData.email,
    sessionId: decodeData.sessionId,
    res,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken: tokenData.accessToken,
        csrfToken: tokenData.csrfToken,
      },
      "Token Refresh Successfully",
    ),
  );
});

export const logout = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  await revokeRefreshToken(userId, res);
  res.clearCookie("accessToken");
  redisClient.del(`user:${userId}`);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logout Successfully"));
});

export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = sanitize(req.body);
  if (!email) throw new ApiError(400, "Email is required");

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Rate limit check for resending OTP
  const resendRateLimitKey = `resendRateLimit:${req.ip}:${email}`;
  const isResendRateLimited = await redisClient.get(resendRateLimitKey);
  if (isResendRateLimited) {
    throw new ApiError(429, "Please wait before requesting another OTP");
  }

  // Generate new OTP
  const otpGenerated = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP in Redis (5 minutes)
  const otpKey = `otp:${email}`;
  await redisClient.set(otpKey, otpGenerated, { ex: 300 });

  // Send OTP email
  const subject = "Your New OTP for Login";
  const html = getOTPHTML({
    name: user.name,
    email: user.email,
    otp: otpGenerated,
  });

  await sendMail(email, subject, html);

  // Set rate limit for resending OTP (60 seconds)
  await redisClient.set(resendRateLimitKey, "true", { ex: 60 });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `A new OTP has been sent to your email ${user.email}.`,
      ),
    );
});

export const refreshCsrf = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const csrfToken = await rotateCSRFToken(userId, res);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        csrfToken: csrfToken,
      },
      "CSRF Token Refreshed",
    ),
  );
});

export const adminController = asyncHandler(async (req, res) => {});

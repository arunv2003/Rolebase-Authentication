import jwt from "jsonwebtoken";
import { redisClient } from "../app.js";
import {
  generateCSRFToken,
  revokeCSRFToken,
} from "../middlewares/csrfToken.js";

import crypto from "crypto";

const parseToSeconds = (timeStr) => {
  if (!timeStr) return 0;
  const match = timeStr.match(/^(\d+)([smhd])$/);
  if (!match) return parseInt(timeStr) || 0;
  const value = parseInt(match[1]);
  const unit = match[2];
  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 3600;
    case "d":
      return value * 86400;
    default:
      return value;
  }
};

export const generateToken = async ({ userId, email, res }) => {
  const sessionId = crypto.randomBytes(16).toString("hex");

  const accessToken = jwt.sign(
    { userId, email, sessionId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.expiresIn },
  );
  const refreshToken = jwt.sign(
    { userId, email, sessionId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.refreshTokenExpiresIn },
  );

  const refreshTokenKey = `refreshToken:${userId}`;
  const activeSessionKey = `active_session:${userId}`;
  const activeSessionDataKey = `active_session_data:${sessionId}`;

  const oldSessionId = await redisClient.get(activeSessionKey);

  if (oldSessionId) {
    await redisClient.del(`active_session_data:${oldSessionId}`);
  }

  const sessionData = {
    userId,
    sessionId,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };

  const refreshExpirySeconds = parseToSeconds(
    process.env.refreshTokenExpiresIn,
  );
  await redisClient.set(refreshTokenKey, refreshToken, {
    ex: refreshExpirySeconds,
  });
  await redisClient.set(activeSessionKey, sessionId, {
    ex: refreshExpirySeconds,
  });
  await redisClient.set(activeSessionDataKey, sessionData, {
    ex: refreshExpirySeconds,
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: parseToSeconds(process.env.expiresIn) * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    // sameSite: "strict",
    maxAge: parseToSeconds(process.env.refreshTokenExpiresIn) * 1000,
    sameSite: "none",
  });

  const csrfToken = await generateCSRFToken(userId, res);

  return { accessToken, refreshToken, csrfToken, sessionId };
};

export const verifyRefreshToken = async (refreshToken) => {
  try {
    const decodedData = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const storedToken = await redisClient.get(
      `refreshToken:${decodedData?.userId}`,
    );

    if (storedToken !== refreshToken) {
      return null;
    }

    const activeSessionId = await redisClient.get(
      `active_session:${decodedData.userId}`,
    );

    if (activeSessionId !== decodedData?.sessionId) {
      return null;
    }

    const sessionData = await redisClient.get(
      `active_session_data:${decodedData.sessionId}`,
    );
    if(!sessionData){
      return null
    }
    
    const parsedSessionData =
      typeof sessionData === "string" ? JSON.parse(sessionData) : sessionData;
    parsedSessionData.lastActive = new Date().toISOString();

    await redisClient.set(
      `active_session_data:${decodedData.sessionId}`,
      JSON.stringify(parsedSessionData),
      { ex: parseToSeconds(process.env.refreshTokenExpiresIn) },
    );
    return decodedData;
  } catch (error) {
    return null;
  }
};

export const generateAccessToken = async ({ userId, email, sessionId, res }) => {
  const accessToken = jwt.sign(
    { userId, email,sessionId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.expiresIn },
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: parseToSeconds(process.env.expiresIn) * 1000,
  });

  const csrfToken = await generateCSRFToken(userId, res);
  return { accessToken, csrfToken };
};

export const revokeRefreshToken = async (userId, res) => {
  const activeSessionId = await redisClient.get(`active_session:${userId}`);
  await redisClient.del(`refreshToken:${userId}`);
  await redisClient.del(`active_session:${userId}`);
  if (activeSessionId) {
    await redisClient.del(`active_session_data:${activeSessionId}`);
  }
  if (res) {
    res.clearCookie("refreshToken");
  }
  await revokeCSRFToken(userId, res);
};


export const isSessionActive = async (userId, sessionId) => {
  const activeSessionId = await redisClient.get(`active_session:${userId}`);
  return activeSessionId === sessionId;
};
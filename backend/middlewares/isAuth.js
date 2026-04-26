import jwt from "jsonwebtoken";
import { redisClient } from "../app.js";
import { User } from "../models/user/user.model.js";
import { ApiResponse } from "../utility/apiResponse.js";
import { isSessionActive } from "../utility/generateToken.js";
import { rotateCSRFToken } from "./csrfToken.js";

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please Login" });
    }

    let decodedData;
    try {
      decodedData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message:
          err.name === "TokenExpiredError" ? "Token Expired" : "Invalid Token",
      });
    }
    console.log(decodedData);

    if (!decodedData || !decodedData.userId) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Token Payload" });
    }

    const isSessionActiveVal = await isSessionActive(decodedData.userId, decodedData.sessionId)

    if (!isSessionActiveVal) {
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        res.clearCookie("csrfToken")
        return res.status(401).json({ success: false, message: "Unauthorized: Session Expired. Please Login Again" });
    }

    if (req.method === "GET") {
        await rotateCSRFToken(decodedData.userId, res)
    }
    // Try to get user from Redis cache
    const cachedUser = await redisClient.get(`user:${decodedData.userId}`);

    if (cachedUser) {
      // Upstash Redis client returns objects if stored as such, or strings.
      // If it's a string, parse it.
      req.user =
        typeof cachedUser === "string" ? JSON.parse(cachedUser) : cachedUser ;

        req.sessionId=decodedData.sessionId;
      return next();
    }

    // If not in cache, get from database
    const user = await User.findById(decodedData.userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Cache the user in Redis for future requests (e.g., for 1 hour)
    await redisClient.set(`user:${user._id}`, JSON.stringify(user), {
      ex: 3600,
    });
        req.sessionId=decodedData.sessionId;
    req.user = user;
    next();
  } catch (error) {
    console.error("isAuth middleware error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export default isAuth;



export const authorizedAdmin = (req, res, next) => {
  const user = req.user;

  if (!user || user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    });
  }
  next();
};

import crypto from "crypto";
import { redisClient } from "../app.js";

export const generateCSRFToken = async (userId, res) => {
    const csrfToken = crypto.randomBytes(32).toString("hex");
    const csrfKey = `csrf:${userId}`;
    await redisClient.set(csrfKey, csrfToken, { ex: 60 * 60 * 24 * 7 });
    res.cookie("csrfToken", csrfToken, { httpOnly: false, secure: true, sameSite: "none", maxAge: 7 * 24 * 60 * 60 * 1000 });
    return csrfToken;
};

export const validateCSRFToken = async (req, res, next) => {
    try {
        if (req.method === "GET") {
            return next();
        }

        const userId = req.user?._id
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
                status: false
            });
        }

        const clientToken = req.headers["x-csrf-token"] || req.headers["x-xsrf-token"] || req.headers["csrf-token"];

        if (!clientToken) {
            return res.status(401).json({
                message: "CSRF token is missing",
                code: "CSRF_TOKEN_MISSING",
                status: false
            });
        }

        const csrfKey = `csrf:${userId}`;

        const storedToken = await redisClient.get(csrfKey);

        if (!storedToken) {
            return res.status(401).json({
                message: "CSRF token is expired",
                code: "CSRF_TOKEN_EXPIRED",
                status: false
            });
        }

        if (clientToken !== storedToken) {
            return res.status(401).json({
                message: "CSRF token is invalid",
                code: "CSRF_TOKEN_INVALID",
                status: false
            });
        }

        console.log("✅ CSRF token is valid")


        next();
    } catch (error) {
        console.log("❌ Error validating CSRF token:", error);
        return res.status(500).json({
            message: "Internal server error",
            status: false
        });
    }
};


export const revokeCSRFToken = async (userId, res) => {
    const csrfKey = `csrf:${userId}`;
    await redisClient.del(csrfKey);
    if (res) {
        res.clearCookie("csrfToken");
    }
}

export const rotateCSRFToken = async (userId, res) => {
    await revokeCSRFToken(userId, res);
    return await generateCSRFToken(userId, res);
}

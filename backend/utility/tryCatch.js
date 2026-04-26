export const asyncHandler = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            console.error("Error in handler:", error);

            if (res.headersSent) {
                return next(error);
            }

            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ message: "Validation Error", errors });
            }
            if (error.statusCode) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            if (error.code === 11000) {
                return res.status(409).json({ message: "User with this email already exists" });
            }
            res.json({ message: error.message });
        }
    }
}
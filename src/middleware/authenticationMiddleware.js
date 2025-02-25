import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticator = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization token is required" });
        }

        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
            if (error) {
                return res.status(401).json({ message: "Invalid or expired token, please log in again" });
            }

            if (!decoded || !decoded.id) {
                return res.status(401).json({ message: "Token is invalid or missing user ID" });
            }

            req.user = decoded; // Assign the decoded payload to req.user
            console.log("Decoded Token:", req.user); // Debugging output

            next();
        });

    } catch (error) {
        console.error("Authentication Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

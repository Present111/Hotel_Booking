import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

const jwtSecret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;

if (!jwtSecret) {
  throw new Error("JWT secret is not configured");
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // Check for token in Authorization header first (for axios interceptor)
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    // Fallback to session cookie
    token = req.cookies["session_id"];
  }

  if (!token) {
    return res.status(401).json({ message: "unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = (decoded as JwtPayload).userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "unauthorized" });
  }
};

export default verifyToken;

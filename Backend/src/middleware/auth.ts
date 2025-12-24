import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId: string;
      userRole?: UserRole;
    }
  }
}

type UserRole = "user" | "admin" | "hotel_owner";

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
    // Fallback to cookies (support both legacy and new names)
    token = req.cookies["session_id"] || req.cookies["auth_token"];
  }

  if (!token) {
    return res.status(401).json({ message: "unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const payload = decoded as JwtPayload & { role?: UserRole };

    req.userId = payload.userId;
    req.userRole = payload.role || "user";
    next();
  } catch (error) {
    return res.status(401).json({ message: "unauthorized" });
  }
};

export const authorizeRoles =
  (...allowedRoles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const role = req.userRole || "user";

    // Allow admins everywhere
    if (role === "admin") {
      return next();
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "forbidden" });
    }

    next();
  };

export default verifyToken;

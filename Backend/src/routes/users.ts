import express, { Request, Response } from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { check, validationResult, body } from "express-validator";
import verifyToken from "../middleware/auth";

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;

if (!jwtSecret) {
  throw new Error("JWT secret is not configured");
}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         address:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     RegisterUserRequest:
 *       type: object
 *       required: [firstName, lastName, email, password]
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Something went wrong
 */
router.get("/me", verifyToken, async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
});

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserRequest'
 *     responses:
 *       200:
 *         description: User registered
 *       400:
 *         description: Validation failed or user already exists
 *       500:
 *         description: Something went wrong
 */
router.post(
  "/register",
  [
    check("firstName", "First Name is required").isString(),
    check("lastName", "Last Name is required").isString(),
    check("email", "Email is required").isEmail(),
    check("password", "Password with 6 or more characters required").isLength({
      min: 6,
    }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    try {
      let user = await User.findOne({
        email: req.body.email,
      });

      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Ensure clients cannot elevate privileges during sign-up
      user = new User({
        ...req.body,
        role: "user",
      });
      await user.save();

      const token = jwt.sign(
        { userId: user.id, role: user.role || "user" },
        jwtSecret,
        {
          expiresIn: "1d",
        }
      );

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 86400000,
        path: "/",
      });
      res.cookie("session_id", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 86400000,
        path: "/",
      });
      return res.status(200).send({
        message: "User registered OK",
        userId: user._id,
        role: user.role || "user",
        token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Something went wrong" });
    }
  }
);

// Update current user profile
router.patch(
  "/me",
  verifyToken,
  [
    body("email").optional().isEmail().withMessage("Email must be valid"),
    body("firstName").optional().isString().withMessage("First name must be text"),
    body("lastName").optional().isString().withMessage("Last name must be text"),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("phone").optional().isString(),
    body("address.street").optional().isString(),
    body("address.city").optional().isString(),
    body("address.state").optional().isString(),
    body("address.country").optional().isString(),
    body("address.zipCode").optional().isString(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { email, firstName, lastName, password, phone, address } = req.body;

      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({ message: "Email already in use" });
        }
        user.email = email;
      }

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (password) user.password = password;
      if (phone !== undefined) user.phone = phone;

      if (address) {
        user.address = {
          street: address.street || "",
          city: address.city || "",
          state: address.state || "",
          country: address.country || "",
          zipCode: address.zipCode || "",
        };
      }

      user.updatedAt = new Date();

      await user.save();
      const sanitizedUser = user.toObject();
      delete (sanitizedUser as any).password;

      res.status(200).json(sanitizedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unable to update profile" });
    }
  }
);

export default router;

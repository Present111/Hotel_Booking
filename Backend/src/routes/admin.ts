import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import verifyToken, { authorizeRoles } from "../middleware/auth";
import Booking from "../models/booking";
import Hotel from "../models/hotel";
import User from "../models/user";

const router = express.Router();

// List all users for admin management
router.get(
  "/users",
  verifyToken,
  authorizeRoles("admin"),
  async (req: Request, res: Response) => {
    try {
      const users = await User.find().select("-password").sort("-createdAt");
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unable to fetch users" });
    }
  }
);

// Create a user as admin
router.post(
  "/users",
  verifyToken,
  authorizeRoles("admin"),
  [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["user", "admin", "hotel_owner"])
      .withMessage("Invalid role"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { firstName, lastName, email, password, role, phone, isActive } =
        req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = new User({
        firstName,
        lastName,
        email,
        password,
        role: role || "user",
        phone,
        isActive: typeof isActive === "boolean" ? isActive : true,
      });

      await user.save();
      const sanitizedUser = user.toObject();
      delete (sanitizedUser as any).password;

      res.status(201).json(sanitizedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unable to create user" });
    }
  }
);

// Update a user as admin
router.patch(
  "/users/:id",
  verifyToken,
  authorizeRoles("admin"),
  [
    body("email").optional().isEmail().withMessage("Email must be valid"),
    body("role")
      .optional()
      .isIn(["user", "admin", "hotel_owner"])
      .withMessage("Invalid role"),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { firstName, lastName, email, role, phone, isActive, password } =
        req.body;

      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({ message: "Email already exists" });
        }
        user.email = email;
      }

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (role) user.role = role;
      if (phone !== undefined) user.phone = phone;
      if (typeof isActive === "boolean") user.isActive = isActive;
      if (password) user.password = password;

      user.updatedAt = new Date();

      await user.save();
      const sanitizedUser = user.toObject();
      delete (sanitizedUser as any).password;

      res.status(200).json(sanitizedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unable to update user" });
    }
  }
);

// Delete a user as admin
router.delete(
  "/users/:id",
  verifyToken,
  authorizeRoles("admin"),
  async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Clean up related bookings and hotels owned by the user
      await Booking.deleteMany({ userId: user._id.toString() });
      const ownedHotels = await Hotel.find({ userId: user._id.toString() });
      if (ownedHotels.length > 0) {
        await Booking.deleteMany({
          hotelId: { $in: ownedHotels.map((hotel) => hotel._id.toString()) },
        });
        await Hotel.deleteMany({ userId: user._id.toString() });
      }

      await User.findByIdAndDelete(req.params.id);

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unable to delete user" });
    }
  }
);

// Manual booking creation for admins (no payment intent needed)
router.post(
  "/bookings",
  verifyToken,
  authorizeRoles("admin"),
  [
    body("userId").notEmpty().withMessage("userId is required"),
    body("hotelId").notEmpty().withMessage("hotelId is required"),
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("adultCount")
      .isInt({ min: 1 })
      .withMessage("Adult count must be at least 1"),
    body("childCount")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Child count must be 0 or more"),
    body("checkIn").isISO8601().withMessage("Check-in date is required"),
    body("checkOut").isISO8601().withMessage("Check-out date is required"),
    body("totalCost")
      .isNumeric()
      .withMessage("Total cost must be provided as a number"),
    body("status")
      .optional()
      .isIn(["pending", "confirmed", "cancelled", "completed", "refunded"]),
    body("paymentStatus")
      .optional()
      .isIn(["pending", "paid", "failed", "refunded"]),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        userId,
        hotelId,
        firstName,
        lastName,
        email,
        phone,
        adultCount,
        childCount,
        checkIn,
        checkOut,
        totalCost,
        status,
        paymentStatus,
        paymentMethod,
        specialRequests,
      } = req.body;

      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      if (checkOutDate <= checkInDate) {
        return res
          .status(400)
          .json({ message: "Check-out date must be after check-in date" });
      }

      const newBooking = new Booking({
        userId,
        hotelId,
        firstName,
        lastName,
        email,
        phone,
        adultCount,
        childCount,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalCost: Number(totalCost),
        status: status || "confirmed",
        paymentStatus: paymentStatus || "paid",
        paymentMethod: paymentMethod || "manual",
        specialRequests,
      });

      await newBooking.save();

      // Update analytics for hotel and user
      await Hotel.findByIdAndUpdate(hotelId, {
        $inc: {
          totalBookings: 1,
          totalRevenue: newBooking.totalCost || 0,
        },
      });

      await User.findByIdAndUpdate(userId, {
        $inc: {
          totalBookings: 1,
          totalSpent: newBooking.totalCost || 0,
        },
      });

      res.status(201).json(newBooking);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unable to create booking" });
    }
  }
);

export default router;

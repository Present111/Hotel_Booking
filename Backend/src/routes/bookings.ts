import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import verifyToken from "../middleware/auth";
import Booking from "../models/booking";
import Hotel from "../models/hotel";
import User from "../models/user";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         hotelId:
 *           type: string
 *         userId:
 *           type: string
 *         checkIn:
 *           type: string
 *           format: date
 *         checkOut:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed, refunded]
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *         totalCost:
 *           type: number
 *         guests:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     BookingStatusUpdate:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed, refunded]
 *         cancellationReason:
 *           type: string
 *         refundAmount:
 *           type: number
 *     BookingPaymentUpdate:
 *       type: object
 *       required:
 *         - paymentStatus
 *       properties:
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *         paymentMethod:
 *           type: string
 */

// Get all bookings (admin only)
/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Unable to fetch bookings
 */
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate("hotelId", "name city country");

    res.status(200).json(bookings);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
});

// Get bookings by hotel ID (for hotel owners)
/**
 * @swagger
 * /api/bookings/hotel/{hotelId}:
 *   get:
 *     summary: Get bookings for a specific hotel
 *     tags: [Bookings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         schema:
 *           type: string
 *         required: true
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: List of bookings for the hotel
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Unable to fetch hotel bookings
 */
router.get(
  "/hotel/:hotelId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { hotelId } = req.params;

      // Verify the hotel belongs to the authenticated user
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      if (hotel.userId !== req.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const bookings = await Booking.find({ hotelId })
        .sort({ createdAt: -1 })
        .populate("userId", "firstName lastName email");

      res.status(200).json(bookings);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to fetch hotel bookings" });
    }
  }
);

// Get booking by ID
/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Unable to fetch booking
 */
router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      "hotelId",
      "name city country imageUrls"
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch booking" });
  }
});

// Update booking status
/**
 * @swagger
 * /api/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status
 *     tags: [Bookings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingStatusUpdate'
 *     responses:
 *       200:
 *         description: Booking updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Unable to update booking
 */
router.patch(
  "/:id/status",
  verifyToken,
  [
    body("status")
      .isIn(["pending", "confirmed", "cancelled", "completed", "refunded"])
      .withMessage("Invalid status"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { status, cancellationReason } = req.body;

      const updateData: any = { status };
      if (status === "cancelled" && cancellationReason) {
        updateData.cancellationReason = cancellationReason;
      }
      if (status === "refunded") {
        updateData.refundAmount = req.body.refundAmount || 0;
      }

      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.status(200).json(booking);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to update booking" });
    }
  }
);

// Update payment status
/**
 * @swagger
 * /api/bookings/{id}/payment:
 *   patch:
 *     summary: Update booking payment status
 *     tags: [Bookings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingPaymentUpdate'
 *     responses:
 *       200:
 *         description: Payment status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Unable to update payment status
 */
router.patch(
  "/:id/payment",
  verifyToken,
  [
    body("paymentStatus")
      .isIn(["pending", "paid", "failed", "refunded"])
      .withMessage("Invalid payment status"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { paymentStatus, paymentMethod } = req.body;

      const updateData: any = { paymentStatus };
      if (paymentMethod) {
        updateData.paymentMethod = paymentMethod;
      }

      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.status(200).json(booking);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to update payment status" });
    }
  }
);

// Delete booking (admin only)
/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Delete a booking
 *     tags: [Bookings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Unable to delete booking
 */
router.delete("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update hotel analytics
    await Hotel.findByIdAndUpdate(booking.hotelId, {
      $inc: {
        totalBookings: -1,
        totalRevenue: -(booking.totalCost || 0),
      },
    });

    // Update user analytics
    await User.findByIdAndUpdate(booking.userId, {
      $inc: {
        totalBookings: -1,
        totalSpent: -(booking.totalCost || 0),
      },
    });

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to delete booking" });
  }
});

export default router;

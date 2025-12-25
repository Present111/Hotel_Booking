import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import Booking from "../models/booking";
import Hotel from "../models/hotel";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     HotelWithBookings:
 *       allOf:
 *         - $ref: '#/components/schemas/Hotel'
 *       properties:
 *         bookings:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Booking'
 */

/**
 * @swagger
 * /api/my-bookings:
 *   get:
 *     summary: Get bookings for the authenticated user
 *     tags: [MyBookings]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of hotels with the user's bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HotelWithBookings'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Unable to fetch bookings
 */
// /api/my-bookings
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    // Get user's bookings from separate collection
    const userBookings = await Booking.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    // Get hotel details for each booking
    const results = await Promise.all(
      userBookings.map(async (booking) => {
        const hotel = await Hotel.findById(booking.hotelId);
        if (!hotel) {
          return null;
        }

        // Create response object with hotel and booking data
        const hotelWithUserBookings = {
          ...hotel.toObject(),
          bookings: [booking.toObject()],
        };

        return hotelWithUserBookings;
      })
    );

    // Filter out null results and send
    const validResults = results.filter((result) => result !== null);
    res.status(200).send(validResults);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
});

export default router;

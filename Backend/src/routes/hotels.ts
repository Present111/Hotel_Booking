import express, { Request, Response } from "express";
import { param, validationResult } from "express-validator";
import Stripe from "stripe";
import { BookingType, HotelSearchResponse } from "../../../shared/types";
import verifyToken from "../middleware/auth";
import Booking from "../models/booking";
import Hotel from "../models/hotel";
import User from "../models/user";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Hotel:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         name:
 *           type: string
 *         city:
 *           type: string
 *         country:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: array
 *           items:
 *             type: string
 *         adultCount:
 *           type: integer
 *         childCount:
 *           type: integer
 *         facilities:
 *           type: array
 *           items:
 *             type: string
 *         pricePerNight:
 *           type: number
 *         starRating:
 *           type: number
 *         imageUrls:
 *           type: array
 *           items:
 *             type: string
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *         location:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *             longitude:
 *               type: number
 *             address:
 *               type: object
 *               properties:
 *                 street:
 *                   type: string
 *                 city:
 *                   type: string
 *                 state:
 *                   type: string
 *                 country:
 *                   type: string
 *                 zipCode:
 *                   type: string
 *         contact:
 *           type: object
 *           properties:
 *             phone:
 *               type: string
 *             email:
 *               type: string
 *             website:
 *               type: string
 *         policies:
 *           type: object
 *           properties:
 *             checkInTime:
 *               type: string
 *             checkOutTime:
 *               type: string
 *             cancellationPolicy:
 *               type: string
 *             petPolicy:
 *               type: string
 *             smokingPolicy:
 *               type: string
 *         amenities:
 *           type: object
 *           properties:
 *             parking:
 *               type: boolean
 *             wifi:
 *               type: boolean
 *             pool:
 *               type: boolean
 *             gym:
 *               type: boolean
 *             spa:
 *               type: boolean
 *             restaurant:
 *               type: boolean
 *             bar:
 *               type: boolean
 *             airportShuttle:
 *               type: boolean
 *             businessCenter:
 *               type: boolean
 *         totalBookings:
 *           type: number
 *         totalRevenue:
 *           type: number
 *         averageRating:
 *           type: number
 *         reviewCount:
 *           type: number
 *         occupancyRate:
 *           type: number
 *         isActive:
 *           type: boolean
 *         isFeatured:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     HotelSearchResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Hotel'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             page:
 *               type: integer
 *             pages:
 *               type: integer
 *     PaymentIntentRequest:
 *       type: object
 *       required:
 *         - numberOfNights
 *       properties:
 *         numberOfNights:
 *           type: integer
 *           minimum: 1
 *     PaymentIntentResponse:
 *       type: object
 *       properties:
 *         paymentIntentId:
 *           type: string
 *         clientSecret:
 *           type: string
 *         totalCost:
 *           type: number
 *     HotelBookingRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - adultCount
 *         - childCount
 *         - checkIn
 *         - checkOut
 *         - paymentIntentId
 *         - totalCost
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         adultCount:
 *           type: integer
 *         childCount:
 *           type: integer
 *         checkIn:
 *           type: string
 *           format: date
 *         checkOut:
 *           type: string
 *           format: date
 *         totalCost:
 *           type: number
 *         paymentIntentId:
 *           type: string
 *         hotelId:
 *           type: string
 *           description: Populated from the URL, not required in the body
 *         specialRequests:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/hotels/search:
 *   get:
 *     summary: Search hotels with filters and pagination
 *     tags: [Hotels]
 *     parameters:
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: City or country to search
 *       - in: query
 *         name: adultCount
 *         schema:
 *           type: integer
 *         description: Minimum number of adults the hotel must support
 *       - in: query
 *         name: childCount
 *         schema:
 *           type: integer
 *         description: Minimum number of children the hotel must support
 *       - in: query
 *         name: facilities
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: true
 *         description: List of facilities that must all be present
 *       - in: query
 *         name: types
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: true
 *         description: Filter by hotel type(s)
 *       - in: query
 *         name: stars
 *         schema:
 *           type: array
 *           items:
 *             type: integer
 *         style: form
 *         explode: true
 *         description: Filter by star ratings
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: integer
 *         description: Maximum price per night
 *       - in: query
 *         name: sortOption
 *         schema:
 *           type: string
 *           enum: [starRating, pricePerNightAsc, pricePerNightDesc]
 *         description: Sort order for results
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of hotels matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HotelSearchResponse'
 *       500:
 *         description: Something went wrong while searching hotels
 */
router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = constructSearchQuery(req.query);

    let sortOptions = {};
    switch (req.query.sortOption) {
      case "starRating":
        sortOptions = { starRating: -1 };
        break;
      case "pricePerNightAsc":
        sortOptions = { pricePerNight: 1 };
        break;
      case "pricePerNightDesc":
        sortOptions = { pricePerNight: -1 };
        break;
    }

    const pageSize = 5;
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : "1"
    );
    const skip = (pageNumber - 1) * pageSize;

    const hotels = await Hotel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const total = await Hotel.countDocuments(query);

    const response: HotelSearchResponse = {
      data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * @swagger
 * /api/hotels:
 *   get:
 *     summary: Get all hotels
 *     tags: [Hotels]
 *     responses:
 *       200:
 *         description: List of all hotels sorted by last updated date
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hotel'
 *       500:
 *         description: Error fetching hotels
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find().sort("-lastUpdated");
    res.json(hotels);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

/**
 * @swagger
 * /api/hotels/{id}:
 *   get:
 *     summary: Get a hotel by ID
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Hotel found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hotel'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Error fetching hotel
 */
router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Hotel ID is required")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = req.params.id.toString();

    try {
      const hotel = await Hotel.findById(id);
      res.json(hotel);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error fetching hotel" });
    }
  }
);

/**
 * @swagger
 * /api/hotels/{hotelId}/bookings/payment-intent:
 *   post:
 *     summary: Create a Stripe payment intent for a hotel booking
 *     tags: [Hotels]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentIntentRequest'
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentIntentResponse'
 *       400:
 *         description: Hotel not found or invalid payment intent request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Error creating payment intent
 */
router.post(
  "/:hotelId/bookings/payment-intent",
  verifyToken,
  async (req: Request, res: Response) => {
    const { numberOfNights } = req.body;
    const hotelId = req.params.hotelId;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(400).json({ message: "Hotel not found" });
    }

    const totalCost = hotel.pricePerNight * numberOfNights;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCost * 100,
      currency: "gbp",
      metadata: {
        hotelId,
        userId: req.userId,
        bookingAttempt: Date.now().toString(),
      },
    });

    if (!paymentIntent.client_secret) {
      return res.status(500).json({ message: "Error creating payment intent" });
    }

    const response = {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret.toString(),
      totalCost,
    };

    res.send(response);
  }
);

/**
 * @swagger
 * /api/hotels/{hotelId}/bookings:
 *   post:
 *     summary: Create a booking after successful payment
 *     tags: [Hotels]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HotelBookingRequest'
 *     responses:
 *       200:
 *         description: Booking created successfully
 *       400:
 *         description: Payment intent validation failed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Something went wrong while creating booking
 */
router.post(
  "/:hotelId/bookings",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const paymentIntentId = req.body.paymentIntentId;

      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId as string
      );

      if (!paymentIntent) {
        return res.status(400).json({ message: "payment intent not found" });
      }

      if (
        paymentIntent.metadata.hotelId !== req.params.hotelId ||
        paymentIntent.metadata.userId !== req.userId
      ) {
        return res.status(400).json({ message: "payment intent mismatch" });
      }

      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({
          message: `payment intent not succeeded. Status: ${paymentIntent.status}`,
        });
      }

      const newBooking: BookingType = {
        ...req.body,
        userId: req.userId,
        hotelId: req.params.hotelId,
        createdAt: new Date(), // Add booking creation timestamp
        status: "confirmed", // Set initial status
        paymentStatus: "paid", // Set payment status since payment succeeded
      };

      // Create booking in separate collection
      const booking = new Booking(newBooking);
      await booking.save();

      // Update hotel analytics
      await Hotel.findByIdAndUpdate(req.params.hotelId, {
        $inc: {
          totalBookings: 1,
          totalRevenue: newBooking.totalCost,
        },
      });

      // Update user analytics
      await User.findByIdAndUpdate(req.userId, {
        $inc: {
          totalBookings: 1,
          totalSpent: newBooking.totalCost,
        },
      });

      res.status(200).send();
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "something went wrong" });
    }
  }
);

const constructSearchQuery = (queryParams: any) => {
  let constructedQuery: any = {};

  if (queryParams.destination && queryParams.destination.trim() !== "") {
    const destination = queryParams.destination.trim();

    constructedQuery.$or = [
      { city: { $regex: destination, $options: "i" } },
      { country: { $regex: destination, $options: "i" } },
    ];
  }

  if (queryParams.adultCount) {
    constructedQuery.adultCount = {
      $gte: parseInt(queryParams.adultCount),
    };
  }

  if (queryParams.childCount) {
    constructedQuery.childCount = {
      $gte: parseInt(queryParams.childCount),
    };
  }

  if (queryParams.facilities) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities
        : [queryParams.facilities],
    };
  }

  if (queryParams.types) {
    constructedQuery.type = {
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  if (queryParams.stars) {
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star: string) => parseInt(star))
      : parseInt(queryParams.stars);

    constructedQuery.starRating = { $in: starRatings };
  }

  if (queryParams.maxPrice) {
    constructedQuery.pricePerNight = {
      $lte: parseInt(queryParams.maxPrice).toString(),
    };
  }

  return constructedQuery;
};

export default router;

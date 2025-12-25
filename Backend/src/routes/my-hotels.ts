import { v2 as cloudinary } from "cloudinary";
import express, { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import multer from "multer";
import { HotelType } from "../../../shared/types";
import verifyToken, { authorizeRoles } from "../middleware/auth";
import Hotel from "../models/hotel";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * @swagger
 * components:
 *   schemas:
 *     MyHotelRequest:
 *       type: object
 *       properties:
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
 *         imageFiles:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 */

/**
 * @swagger
 * /api/my-hotels:
 *   post:
 *     summary: Create a hotel for the authenticated owner
 *     tags: [MyHotels]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/MyHotelRequest'
 *     responses:
 *       201:
 *         description: Hotel created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hotel'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Something went wrong
 */
router.post(
  "/",
  verifyToken,
  authorizeRoles("hotel_owner", "admin"),

  upload.array("imageFiles", 6),

  [
    body("name").notEmpty().withMessage("Name is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("type").notEmpty().withMessage("Hotel type is required"),
    body("pricePerNight")
      .notEmpty()
      .isNumeric()
      .withMessage("Price per night is required and must be a number"),
    body("facilities")
      .notEmpty()
      .isArray()
      .withMessage("Facilities are required"),
  ],

  async (req: Request, res: Response) => {
    try {
      const imageFiles = req.files as Express.Multer.File[];

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
      }

      const newHotel: HotelType = req.body;

      newHotel.contact = {
        phone: req.body["contact.phone"] || "",
        email: req.body["contact.email"] || "",
        website: req.body["contact.website"] || "",
      };

      newHotel.policies = {
        checkInTime: req.body["policies.checkInTime"] || "",
        checkOutTime: req.body["policies.checkOutTime"] || "",
        cancellationPolicy: req.body["policies.cancellationPolicy"] || "",
        petPolicy: req.body["policies.petPolicy"] || "",
        smokingPolicy: req.body["policies.smokingPolicy"] || "",
      };

      newHotel.lastUpdated = new Date();
      newHotel.userId = req.userId;

      if (imageFiles && imageFiles.length > 0) {
        const imageUrls = await uploadImages(imageFiles);
        newHotel.imageUrls = imageUrls;
      } else {
        newHotel.imageUrls = [];
      }

      const hotel = new Hotel(newHotel);
      await hotel.save();

      res.status(201).send(hotel);
    } catch (e) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

/**
 * @swagger
 * /api/my-hotels:
 *   get:
 *     summary: Get all hotels owned by the authenticated user
 *     tags: [MyHotels]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of hotels owned by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hotel'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Error fetching hotels
 */
router.get(
  "/",
  verifyToken,
  authorizeRoles("hotel_owner", "admin"),
  async (req: Request, res: Response) => {
    try {
      const filter = req.userRole === "admin" ? {} : { userId: req.userId };
      const hotels = await Hotel.find(filter);
      res.json(hotels);
    } catch (error) {
      res.status(500).json({ message: "Error fetching hotels" });
    }
  }
);

/**
 * @swagger
 * /api/my-hotels/{id}:
 *   get:
 *     summary: Get a specific hotel owned by the authenticated user
 *     tags: [MyHotels]
 *     security:
 *       - cookieAuth: []
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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Error fetching hotels
 */
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("hotel_owner", "admin"),
  async (req: Request, res: Response) => {
    const id = req.params.id.toString();
    try {
      const filter =
        req.userRole === "admin"
          ? { _id: id }
          : {
              _id: id,
              userId: req.userId,
            };
      const hotel = await Hotel.findOne(filter);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      res.status(500).json({ message: "Error fetching hotels" });
    }
  }
);

/**
 * @swagger
 * /api/my-hotels/{hotelId}:
 *   put:
 *     summary: Update a hotel owned by the authenticated user
 *     tags: [MyHotels]
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
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/MyHotelRequest'
 *     responses:
 *       200:
 *         description: Hotel updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hotel'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Something went wrong
 */
router.put(
  "/:hotelId",
  verifyToken,
  authorizeRoles("hotel_owner", "admin"),
  upload.array("imageFiles"),
  async (req: Request, res: Response) => {
    try {
      console.log("Request body:", req.body);
      console.log("Hotel ID:", req.params.hotelId);
      console.log("User ID:", req.userId);

      // First, find the existing hotel
      const existingHotel = await Hotel.findOne(
        req.userRole === "admin"
          ? { _id: req.params.hotelId }
          : { _id: req.params.hotelId, userId: req.userId }
      );

      if (!existingHotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      // Prepare update data
      const updateData: any = {
        name: req.body.name,
        city: req.body.city,
        country: req.body.country,
        description: req.body.description,
        type: Array.isArray(req.body.type) ? req.body.type : [req.body.type],
        pricePerNight: Number(req.body.pricePerNight),
        starRating: Number(req.body.starRating),
        adultCount: Number(req.body.adultCount),
        childCount: Number(req.body.childCount),
        facilities: Array.isArray(req.body.facilities)
          ? req.body.facilities
          : [req.body.facilities],
        lastUpdated: new Date(),
      };

      // Handle contact information
      updateData.contact = {
        phone: req.body["contact.phone"] || "",
        email: req.body["contact.email"] || "",
        website: req.body["contact.website"] || "",
      };

      // Handle policies
      updateData.policies = {
        checkInTime: req.body["policies.checkInTime"] || "",
        checkOutTime: req.body["policies.checkOutTime"] || "",
        cancellationPolicy: req.body["policies.cancellationPolicy"] || "",
        petPolicy: req.body["policies.petPolicy"] || "",
        smokingPolicy: req.body["policies.smokingPolicy"] || "",
      };

      // Update the hotel
      const updatedHotel = await Hotel.findByIdAndUpdate(
        req.params.hotelId,
        updateData,
        { new: true }
      );

      if (!updatedHotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      // Handle image uploads if any
      const files = (req as any).files as any[];
      if (files && files.length > 0) {
        const updatedImageUrls = await uploadImages(files);
        updatedHotel.imageUrls = [
          ...updatedImageUrls,
          ...(req.body.imageUrls
            ? Array.isArray(req.body.imageUrls)
              ? req.body.imageUrls
              : [req.body.imageUrls]
            : []),
        ];
        await updatedHotel.save();
      }

      res.status(200).json(updatedHotel);
    } catch (error) {
      console.error("Error updating hotel:", error);
      console.error("Request body:", req.body);
      console.error("Hotel ID:", req.params.hotelId);
      console.error("User ID:", req.userId);
      res.status(500).json({
        message: "Something went wrong",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

async function uploadImages(imageFiles: any[]) {
  if (!imageFiles || imageFiles.length === 0) {
    return [];
  }

  const uploadPromises = imageFiles.map(async (image) => {
    const b64 = Buffer.from(image.buffer as Uint8Array).toString("base64");
    let dataURI = "data:" + image.mimetype + ";base64," + b64;

    const res = await cloudinary.uploader.upload(dataURI, {
      folder: "hotel_booking_app",
      transformation: [
        { width: 800, height: 600, crop: "fill" },
        { quality: "auto" },
      ],
    });
    return res.url;
  });

  const imageUrls = await Promise.all(uploadPromises);
  return imageUrls;
}

export default router;

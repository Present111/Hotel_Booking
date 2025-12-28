import express, { Request, Response } from "express";
import Hotel from "../models/hotel";
import { geminiModel } from "../middleware/gemini";
import { HOTEL_SYSTEM_PROMPT } from "../prompts/hotelPrompt";

const router = express.Router();

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    const result = await geminiModel.generateContent([
      { text: HOTEL_SYSTEM_PROMPT },
      { text: message },
    ]);

    const text = result.response.text();
    const filters = safeJsonParse(text);

    const query: any = { isActive: true };

    if (filters.city) query.city = filters.city;
    if (filters.starRating)
      query.starRating = { $gte: filters.starRating };
    if (filters.maxPrice)
      query.pricePerNight = { $lte: filters.maxPrice };
    if (filters.facilities?.length > 0)
      query.facilities = { $all: filters.facilities };

    let sort: any = {};
    if (filters.sort === "price_asc") sort = { pricePerNight: 1 };
    if (filters.sort === "price_desc") sort = { pricePerNight: -1 };
    if (filters.sort === "star_desc") sort = { starRating: -1 };

    const hotels = await Hotel.find(query).sort(sort).limit(5);

    res.json({
      intent: "HOTEL_RECOMMEND",
      filters,
      results: hotels,
      message: buildExplain(filters, hotels),
    });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ message: "AI processing failed" });
  }
});

export default router;

// ===== helpers =====
function safeJsonParse(text: string) {
  return JSON.parse(
    text.replace(/```json/g, "").replace(/```/g, "").trim()
  );
}

function buildExplain(filters: any, hotels: any[]) {
  if (hotels.length === 0)
    return "Không tìm thấy khách sạn phù hợp 😢";

  let msg = "Mình gợi ý khách sạn ";
  if (filters.city) msg += `tại ${filters.city}, `;
  if (filters.starRating) msg += `${filters.starRating} sao trở lên, `;
  if (filters.maxPrice) msg += `giá dưới ${filters.maxPrice}, `;
  if (filters.facilities?.length)
    msg += `có ${filters.facilities.join(", ")}, `;

  return msg + "phù hợp nhất với nhu cầu của bạn 👌";
}

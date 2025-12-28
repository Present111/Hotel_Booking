import express, { Request, Response } from "express";
import Hotel from "../models/hotel";
import { geminiModel } from "../middleware/gemini";
import { HOTEL_SYSTEM_PROMPT } from "../prompts/hotelPrompt";

const router = express.Router();

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    // ===== 1️⃣ GỌI GEMINI =====
    const result = await geminiModel.generateContent([
      { text: HOTEL_SYSTEM_PROMPT },
      { text: message },
    ]);

    const text = result.response.text();
    const filters = safeJsonParse(text);

    // ===== 2️⃣ BUILD MATCH QUERY =====
    const match: any = { isActive: true };

    if (filters.city) match.city = filters.city;
    if (filters.starRating)
      match.starRating = { $gte: filters.starRating };
    if (filters.facilities?.length > 0)
      match.facilities = { $all: filters.facilities };

    // ⚠️ KHÔNG filter price ở đây vì price là string
    // sẽ filter sau khi convert

    // ===== 3️⃣ AGGREGATION PIPELINE =====
    const pipeline: any[] = [
      { $match: match },

      // 👉 convert price string → number
      {
        $addFields: {
          priceNum: {
            $toDouble: "$pricePerNight",
          },
        },
      },
    ];

    // ===== 4️⃣ FILTER PRICE (SAU KHI CONVERT) =====
    if (filters.maxPrice) {
      pipeline.push({
        $match: {
          priceNum: { $lte: filters.maxPrice },
        },
      });
    }

    // ===== 5️⃣ SORT =====
    if (filters.sort === "price_asc") {
      pipeline.push({ $sort: { priceNum: 1 } });
    } else if (filters.sort === "price_desc") {
      pipeline.push({ $sort: { priceNum: -1 } });
    } else if (filters.sort === "star_desc") {
      pipeline.push({ $sort: { starRating: -1 } });
    }

    // ===== 6️⃣ LIMIT =====
    pipeline.push({ $limit: 5 });

    const hotels = await Hotel.aggregate(pipeline);

    // ===== 7️⃣ RESPONSE =====
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

// ================= HELPERS =================

function safeJsonParse(text: string) {
  return JSON.parse(
    text.replace(/```json/g, "").replace(/```/g, "").trim()
  );
}

function buildExplain(filters: any, hotels: any[]) {
  if (!hotels || hotels.length === 0) {
    return "Hiện tại hệ thống chưa có khách sạn phù hợp 😢";
  }

  let msg = "Mình gợi ý cho bạn ";

  if (filters.city) msg += `khách sạn tại ${filters.city}, `;
  if (filters.starRating) msg += `${filters.starRating} sao trở lên, `;
  if (filters.maxPrice) msg += `giá dưới ${filters.maxPrice}đ, `;
  if (filters.facilities?.length)
    msg += `có ${filters.facilities.join(", ")}, `;

  if (
    !filters.city &&
    !filters.starRating &&
    !filters.maxPrice &&
    (!filters.facilities || filters.facilities.length === 0)
  ) {
    msg += "những khách sạn đang có trong hệ thống, ";
  }

  return msg + "phù hợp nhất với nhu cầu của bạn 👌";
}

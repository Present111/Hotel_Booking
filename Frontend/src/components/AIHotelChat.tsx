import { useState } from "react";
import { sendHotelAIMessage } from "../lib/ai";

const AIHotelChat = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const res = await sendHotelAIMessage(input);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-semibold">🤖 AI Hotel Assistant</h2>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="VD: Khách sạn 4 sao ở Đà Nẵng có hồ bơi"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="bg-black text-white px-4 rounded"
        >
          {loading ? "Đang tìm..." : "Gửi"}
        </button>
      </div>

      {data && (
        <>
          <p className="italic text-gray-600">{data.message}</p>
          <HotelList hotels={data.results} />
        </>
      )}
    </div>
  );
}

export default AIHotelChat;
function HotelList({ hotels }: { hotels: any[] }) {
  if (!hotels || hotels.length === 0) {
    return <p>Không có khách sạn phù hợp 😢</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {hotels.map((h) => (
        <div
          key={h._id}
          className="border rounded-lg p-3 space-y-1"
        >
          <img
            src={h.imageUrls?.[0]}
            className="w-full h-40 object-cover rounded"
          />
          <h3 className="font-semibold">{h.name}</h3>
          <p>{h.city}, {h.country}</p>
          <p>⭐ {h.starRating} | 💰 {h.pricePerNight}</p>
          <p className="text-sm text-gray-600">
            {h.facilities?.join(", ")}
          </p>
        </div>
      ))}
    </div>
  );
}

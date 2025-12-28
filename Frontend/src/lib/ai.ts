import axios from "axios";
import.meta.env.VITE_API_BASE_URL
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export async function sendHotelAIMessage(message: string) {
  const res = await axios.post(
    `${VITE_API_BASE_URL}/api/ai/chat`,
    { message },
    { withCredentials: true }
  );
  return res.data;
}

import { useState } from "react";
import AIHotelChat from "./AIHotelChat";

const AIHotelWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Icon */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-black text-white flex items-center justify-center shadow-lg hover:scale-105 transition"
      >
        🤖
      </button>

      {/* Chatbox */}
      {open && (
        <div className="fixed bottom-24 right-6 w-[380px] h-[520px] bg-white rounded-xl shadow-2xl border flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <span className="font-semibold">🤖 AI Hotel Assistant</span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <AIHotelChat />
          </div>
        </div>
      )}
    </>
  );
};

export default AIHotelWidget;

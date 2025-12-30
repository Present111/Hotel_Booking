import { useState } from "react";
import { X } from "lucide-react";
import AIHotelChat from "./AIHotelChat";

const AIHotelWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Icon */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open AI Hotel Assistant"
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-transparent flex items-center justify-center hover:scale-110 transition z-[9999]"
      >
        <img
          src="/bot-assistant.svg"
          alt="AI Hotel Assistant"
          className="w-12 h-12 drop-shadow-lg"
          loading="lazy"
        />
      </button>

      {/* Chatbox */}
      {open && (
        <div className="fixed bottom-24 right-6 w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl border border-primary-100 flex flex-col z-[9999]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-primary-100">
            <span className="font-semibold text-primary-900">
              AI Hotel Assistant
            </span>
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

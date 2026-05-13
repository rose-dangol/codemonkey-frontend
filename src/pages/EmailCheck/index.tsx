"use client";

import api from "@/api/ApiUrl";

const EmailCheck = () => {
  return (
    <div>
      <button
        onClick={async () => {
          await api.post("/emails");
        }}
        className="border-4 h-20 w-20"
      >
        send
      </button>
    </div>
  );
};

export default EmailCheck;

"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F0E8] px-4 text-center">
      <h2 className="font-serif text-2xl text-[#2C2C2C] mb-4">
        Something went wrong
      </h2>
      <p className="text-[#8C7B6B] mb-8">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="bg-[#2C2C2C] text-white px-6 py-3 text-sm tracking-widest uppercase hover:bg-[#8C7B6B] transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

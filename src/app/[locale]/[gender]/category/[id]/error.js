
"use client"; // Error components must be Client Components

import { motion } from "motion/react";
import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry
    console.error("Category Page Error:", error);
  }, [error]);

  return (
    <div className="p-8 border-2 border-red-200 rounded-lg bg-red-50">
      <h2 className="text-xl font-bold text-red-700">Something went wrong!</h2>
      <p className="text-red-600 mt-2">
        {error.message || "Failed to load category data."}
      </p>

      <motion.button
        whileHover={{
          scale: 0.95,
        }}
        transition={{
          ease: "easeInOut",
          duration: 0.1,
        }}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        onClick={() => reset()} // Attempt to re-render the segment
      >
        Try again
      </motion.button>
    </div>
  );
}

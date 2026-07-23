"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function SplashScreen() {
  const [shouldRender, setShouldRender] = useState(true); // Start with true
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if splash needs to run
    const hasSeen = sessionStorage.getItem("hasSeenSplash");
    if (hasSeen) {
      setShouldRender(false);
      // Remove class immediately if already seen
      document.documentElement.classList.remove("show-splash");
    }
    // If not seen, keep the class (it's already added by server script)
  }, []);

  useEffect(() => {
    if (!shouldRender || !isMounted) return;

    const timer = setTimeout(() => {
      setShouldRender(false);
      sessionStorage.setItem("hasSeenSplash", "true");
      // Remove class when animation finishes
      document.documentElement.classList.remove("show-splash");
    }, 4000);

    return () => clearTimeout(timer);
  }, [shouldRender, isMounted]);

  // Don't render anything on the server or before hydration
  if (!isMounted || !shouldRender) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="instant-splash-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-white"
      >
        <div className="relative flex items-center justify-center">
          {/* 1. Letter V Logo */}
          <motion.div
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: [0, 1, 1, 0],
              y: [0, 0, 0, -20],
            }}
            transition={{
              duration: 2,
              times: [0, 0.2, 0.8, 1],
              ease: "easeInOut",
            }}
            className="absolute"
          >
            <Image
              src="/V.svg"
              alt="V Logo"
              width={150}
              height={150}
              priority
            />
          </motion.div>

          {/* 2. Full Velvet Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 1.6,
              duration: 0.8,
              ease: "easeOut",
            }}
            className="flex flex-col items-center"
          >
            <Image
              src="/images/logo/velvet-logo-typo-big.svg"
              alt="Velvet Full Logo"
              width={250}
              height={100}
              priority
            />

            <motion.div
              className="mt-8 h-[1px] bg-black w-24 origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                delay: 2,
                duration: 1.5,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
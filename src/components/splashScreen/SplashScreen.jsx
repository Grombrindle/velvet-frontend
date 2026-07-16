// src/components/SplashScreen.jsx
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    return !sessionStorage.getItem("hasSeenSplash");
  });

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    // مدة العرض الإجمالية (مثلاً 3.5 ثانية لتشمل كل المراحل)
    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("hasSeenSplash", "true");
    }, 4000);

    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-999 flex items-center justify-center bg-white"
        >
          <div className="relative flex items-center justify-center">
            {/* 1. حرف الـ V الكبير - يظهر أولاً ثم يختفي */}
            <motion.div
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: [0, 1, 1, 0], // يظهر ثم يثبت ثم يختفي
                y: [0, 0, 0, -20], // حركة بسيطة للأعلى عند الاختفاء
              }}
              transition={{
                duration: 2,
                times: [0, 0.2, 0.8, 1], // توزيع الأنميشن على الـ 1.5 ثانية
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

            {/* 2. لوغو Velvet الكامل - يظهر بعد اختفاء الـ V */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.6, // يبدأ بعد انتهاء أنميشن الـ V تماماً
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

              {/* اللودر يبدأ مع ظهور اللوغو الكامل */}
              <motion.div
                className="mt-8 h-[1px] bg-black w-24 origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  delay: 2, // يبدأ بعد ظهور كلمة Velvet
                  duration: 1.5,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

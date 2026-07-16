"use client";
import Lottie from "lottie-react";
import React from "react";
import loaderAnimation from "../../public/Loader.json"; // عدل المسار حسب اسم ملفك

function LottieAnimationPlayer() {
  return (
    <div className="flex flex-col items-center justify-center size-full">
      <Lottie animationData={loaderAnimation} loop={true} className="size-80" />
    </div>
  );
}

export default LottieAnimationPlayer;

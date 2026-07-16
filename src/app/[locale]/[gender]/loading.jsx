"use client";

import LottieAnimationPlayer from "@/loader/LottieAnimationPlayer";
import Lottie from "lottie-react";
import loaderAnimation from "../../../../public/Loader.gif";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LottieAnimationPlayer />
    </div>
  );
}

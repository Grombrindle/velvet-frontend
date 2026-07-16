"use client";
import Image from "next/image";
import loaderAnimation from "../../../../../../public/Loader.gif";
import LottieAnimationPlayer from "@/loader/LottieAnimationPlayer";

export default function Loading() {
  return (
    <div className=" p-8 h-screen">
      <LottieAnimationPlayer />
    </div>
  );
}

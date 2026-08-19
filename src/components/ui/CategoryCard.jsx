"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";
import { getGenderFromPathname, getLocalePrefix } from "@/lib/locale";

function CategoryCard({ src, desc, id }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const localePrefix = getLocalePrefix(pathname);
  const currentGender = getGenderFromPathname(pathname, searchParams);

  return (
    <Link
      href={`${localePrefix}/${currentGender || "female"}/category/${id}`}
      className="block w-full"
    >
      <div className="relative w-full h-170 overflow-hidden">
        <Image src={src} alt="cloth images" fill className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_100%)]" />
        <div className="absolute bottom-8 start-8 text-white w-full z-10">
          <p className="text-[1.4rem] opacity-90 font-light w-full text-nowrap">
            {desc}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default CategoryCard;

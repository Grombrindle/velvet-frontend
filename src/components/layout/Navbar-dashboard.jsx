"use client";
import { useAuthStore } from "@/lib/store";
import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

const NavbarDashboard = () => {
  const user = useAuthStore((s) => s.user);

  return (
    <div
      style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
      className="lg:static fixed top-0 left-0 right-0 z-50 flex h-22 justify-between items-center lg:px-[4.3rem] px-8 bg-white"
    >
      {/* Logo - Left side */}
      <Link href="/">
        <div className="lg:w-56 w-30 lg:mx-0 mx-6">
          <Image
            src="/images/logo/velvet-logo-typo-big.svg"
            alt="Velvet Logo"
            width={500}
            height={500}
            className="w-full h-auto"
            priority
          />
        </div>
      </Link>

      {/* Right side elements */}
      <div className="flex items-center gap-x-6">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* User Name */}
        <p className="text-[#666666] text-[0.9rem] font-bold hidden sm:block">
          {user?.name || "Guest"}
        </p>

        {/* User Avatar */}
        <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </div>
    </div>
  );
};

export default NavbarDashboard;

"use client";
import { useAuthStore } from "@/lib/store";
import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher"; // Add this import

const NavbarDashboard = () => {
  const user = useAuthStore((s) => s.user);
  return (
    <div
      style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
      className="lg:static fixed top-0 left-0 right-0 z-50 flex h-22 justify-between items-center lg:px-[4.3rem] px-8 bg-white"
    >
      {/* Logo */}
      <Link href="/">
        <div className="lg:w-56 w-30 lg:mx-0 mx-2">
          <Image
            src="/images/logo/velvet-logo-typo-big.svg"
            alt="Velvet Logo"
            width={500}
            height={500}
          />
        </div>
      </Link>
      
      <div className="flex gap-x-4 items-center"> {/* Changed from gap-x-2 to gap-x-4 for more spacing */}
        {/* Add LanguageSwitcher here */}
        <LanguageSwitcher />
        
        <p className="text-[#666666] text-[0.9rem] font-bold">{user?.name}</p>
        <Image
          className="w-[1.8rem]"
          alt="user svg"
          width={0}
          height={0}
          src="/images/user.svg"
        />
      </div>
    </div>
  );
};
export default NavbarDashboard;
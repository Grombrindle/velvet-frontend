"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";

const TextLink = ({ children }) => (
  <p className="text-[#000000] font-normal text-[0.85rem]">{children}</p>
);

const SectionTitle = ({ children }) => (
  <h1 className="text-[#000000] font-bold text-[0.9rem]">{children}</h1>
);

const CategoryItem = ({ children }) => (
  <p className="text-[#000000] font-[400] text-[0.8rem]">{children}</p>
);

const SocialIcon = ({ icon, alt, width = 15, height = 15 }) => (
  <Image src={icon} alt={alt} width={width} height={height} />
);

const SocialMediaIcon = ({ icon, alt }) => (
  <Image
    src={icon}
    alt={alt}
    width={34}
    height={34}
    className="cursor-pointer"
  />
);

const AppStoreIcon = ({ src, alt }) => (
  <Image
    src={src}
    alt={alt}
    width={80}
    height={80}
    className="cursor-pointer"
  />
);

const SocialContactItem = ({ icon, label, isButton }) => {
  const content = (
    <>
      <SocialIcon icon={icon} alt={label} />
      <p className="text-[0.8rem]">{label}</p>
    </>
  );

  if (isButton) {
    return (
      <div className="flex gap-x-2 border border-[#000000] px-2 py-2 hover:bg-gray-100 transition-colors cursor-pointer">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-x-2 hover:underline cursor-pointer">
      {content}
    </div>
  );
};

function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }
  // Data constants
  const CORPORATE_ITEMS = [
    "About us",
    "Respect Life",
    "Our Projects",
    "Career at Koton",
    "Our Policies",
    "Information Society Services",
    "Investor Relations",
  ];

  const HELP_ITEMS = [
    "Frequently Asked Questions",
    "Cancellation & Return Policies",
    "Guide to Creating a Return Request",
    "Order Tracking Without Membership",
    "Personal Data Protection",
    "Whatsapp LPPD",
    "Site Map",
    "Our Stores",
  ];

  const POPULAR_CATEGORIES = [
    "Velvet Romania",
    "Velvet Kazakhstan",
    "Velvet Russia",
    "Velvet Serbia",
    "Christmas Gifts",
    "Women Dress",
    "Women Outerwear",
    "Jacket",
    "Women Coat",
    "Women Skirt",
    "Women Trousers",
    "Women Sweatshirt",
    "Women Sweater",
    "Women Blouse",
    "Women Jacket",
    "Winter Dress",
    "Evening Dress",
    "Knit Dress",
    "Women Trenchcoat",
    "Women Blazer Ja",
    "Women Jeans & Jea",
    "Collection",
    "Women Pajama Set",
    "Bra",
    "Men Coat",
    "Men Sweater",
    "Men Suit",
    "Men Cardigan",
    "Men Sweatshirt",
    "Men Sweatbottoms",
    "Men Trousers",
    "Men Shirt",
    "Men Faux Leather Jacket",
    "Men Jeans & Jean",
    "Collection",
    "Girls Dress",
    "Girls Coat",
    "Kids Tracksuit",
    "Boys Coat",
    "Boys Sweatshirt",
    "BabyGirl Dress",
    "Babyboy Coat",
  ];

  const SOCIAL_ITEMS = [
    {
      icon: "/images/head-phone.svg",
      label: "0850 208 71 71",
      isButton: false,
    },
    { icon: "/images/email.svg", label: "mim@Velvet.com", isButton: false },
    { icon: "/images/wats.svg", label: "Whatsapp", isButton: true },
  ];

  const SOCIAL_MEDIA = [
    { icon: "/images/facebook.svg", alt: "Facebook" },
    { icon: "/images/instagram.svg", alt: "Instagram" },
  ];

  const APP_STORES = [
    { src: "/images/app-store.png", alt: "app-store" },
    { src: "/images/google-play.png", alt: "google-play" },
  ];

  return (
    <div>
      {/* Top Section - App Download */}
      <div className="w-full mx-auto lg:h-[23rem] mt-[3rem] py-[3rem] bg-[#F4F4F4]">
        <div className="flex justify-center text-center items-center flex-col">
          <h1 className="text-[#000000] text-[0.9rem]">Download Our App</h1>
          <p className="text-[#000000] lg:px-0 px-[1rem] text-[0.9rem] font-light">
            Discover our mobile app and get special deals just for you!
          </p>
          <div className="flex gap-x-2 mt-3">
            {APP_STORES.map((store, index) => (
              <AppStoreIcon key={index} src={store.src} alt={store.alt} />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="container1 mx-auto">
          <div className="grid lg:grid-cols-12 lg:gap-y-0 gap-y-[2rem] grid-cols-1 gap-x-[1rem] mt-[1rem]">
            {/* Left Section - Corporate & Help */}
            <div className="lg:col-span-4 col-span-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <SectionTitle>Corporate</SectionTitle>
                  {CORPORATE_ITEMS.map((item, index) => (
                    <TextLink key={index}>{item}</TextLink>
                  ))}
                </div>
                <div>
                  <SectionTitle>Help</SectionTitle>
                  {HELP_ITEMS.map((item, index) => (
                    <TextLink key={index}>{item}</TextLink>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Section - Popular Categories */}
            <div className="lg:col-span-7 col-span-1">
              <div className="grid lg:grid-cols-5 md:grid-cols-3 grid-cols-2 gap-1">
                <SectionTitle>Popular Categories</SectionTitle>
                {POPULAR_CATEGORIES.map((category, index) => (
                  <CategoryItem key={index}>{category}</CategoryItem>
                ))}
              </div>
            </div>

            {/* Right Section - Contact & Social */}
            <div className="col-span-1 lg:ml-[-2.5rem]">
              <div className="flex gap-x-3">
                {/* Vertical Line */}
                <div className="w-[1px] h-[8rem] bg-[#959595]" />

                {/* Contact Info */}
                <div>
                  <SectionTitle>CONTACT US</SectionTitle>
                  <div className="flex flex-col gap-y-4">
                    {SOCIAL_ITEMS.map((item, index) => (
                      <SocialContactItem
                        key={index}
                        icon={item.icon}
                        label={item.label}
                        isButton={item.isButton}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Social Media Icons */}
              <div className="flex gap-x-5 px-2 mt-4">
                {SOCIAL_MEDIA.map((social, index) => (
                  <SocialMediaIcon
                    key={index}
                    icon={social.icon}
                    alt={social.alt}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="w-full h-[3rem] flex justify-center items-center bg-[#000000]">
        <p className="text-white text-[0.8rem]">@ Copyright 2025 Velvet.com</p>
      </div>
    </div>
  );
}

export default Footer;

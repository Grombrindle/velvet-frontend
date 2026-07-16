import Image from "next/image";
import React from "react";

function FeaturesStrip() {
  const images = [
    { image: "/images/feature1.png", desc: "Click & Collect" },
    { image: "/images/feature2.png", desc: "In-store Exchange & Return" },
    { image: "/images/feature3.png", desc: "Cash on Delivery" },
    { image: "/images/feature4.png", desc: "At Your Door in a Click" },
    { image: "/images/feature5.png", desc: "Secure Shopping" },
    { image: "/images/feature6.png", desc: "Free Returns" },
  ];
  return (
    <div className="flex mt-[4rem] justify-center items-center">
      <div className="grid md:grid-cols-3 grid-cols-2">
        {images.map((item, index) => (
          <div
            key={index}
            className={`relative flex flex-col items-center px-16 py-7
              ${index < 3 ? "md:border-b border-[#959595]" : ""}
            `}
          >
            {/* Vertical divider with top & bottom spacing */}
            {index % 3 !== 2 && (
              <span className="md:absolute right-0 top-6 bottom-6 w-px bg-[#959595]" />
            )}

            <Image src={item.image} alt={item.desc} width={40} height={40} />
            <p className="mt-2 text-[#000000] text-sm font-normal text-nowrap">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
 
    </div>
  );
}

export default FeaturesStrip;

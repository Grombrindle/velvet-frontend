"use client";
import { useFaqStore } from "@/lib/store";
import { useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { useFaqByCategory } from "./hooks/useFaq";
import Loader from "../ui/loader";
import ErrorState from "../ui/errorMessage";
import { useLocale, useTranslations } from "next-intl";

const FaqQuestions = () => {
  const [openId, setOpenId] = useState(null);
  const selectedCategory = useFaqStore((state) => state.selectedCategory);
  const t = useTranslations("faq");
  const locale = useLocale();
  const {
    data: faqData,
    isLoading,
    error,
  } = useFaqByCategory(selectedCategory?.id);

  if (!selectedCategory) return null;

  if (isLoading) {
    return <Loader text={t("Loading_questions")} />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  return (
    <div className="container5 mx-auto max-w-2xl mt-10">
      <h1 className="flex justify-center items-center font-bold text-xl mb-6 text-black uppercase tracking-wide">
        {selectedCategory.name}
      </h1>

      {faqData?.map((item) => {
        const isOpen = openId === item.id;

        return (
          <div
            key={item.id}
            className={`w-full bg-white transition-all duration-300 mb-5 ${
              isOpen
                ? "border border-[#959595] shadow-sm"
                : "border-b border-[#D4D4D4]"
            }`}
          >
            <div
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <h2 className="font-bold text-md text-black">{item.question}</h2>
              {locale === "en"?(
                <MdKeyboardArrowRight
                className={`text-[2rem] text-[#666666] transition-transform duration-300 ${
                  isOpen ? "rotate-90" : ""
                }`}
              />
              ):(
                <MdKeyboardArrowLeft
                className={`text-[2rem] text-[#666666] transition-transform duration-300 ${
                  isOpen ? "rotate-90" : ""
                }`}
              />
              )}
            </div>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-4 border-t border-[#D4D4D4] bg-white">
                  <p className="text-gray-800  leading-relaxed w-full">
                    {item.answers[0]?.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FaqQuestions;

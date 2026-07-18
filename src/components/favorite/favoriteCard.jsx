"use client";
import Image from "next/image";
import { useFavorites, useDeleteFavorite } from "./hooks/favorite";
import { toast } from "react-hot-toast";
import { useState } from "react";
import Pagination from "../ui/pagination";
import Loader from "../ui/loader";
import ErrorState from "../ui/errorMessage";
import Link from "next/link";
import { getLocalePrefix } from "@/lib/locale";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

const FavoriteCard = () => {
  const t = useTranslations("favorite");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const localePrefix = getLocalePrefix(pathname);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const { data, isLoading, error } = useFavorites(currentPage);
  const { mutate: deleteFavorite } = useDeleteFavorite();

  const items = data?.items || [];
  const pagination = data?.pagination || {
    current_page: 1,
    last_page: 1,
    total: 0,
  };

  const handleDelete = (productId, productName, e) => {
    e.preventDefault(); // Prevent any immediate navigation
    e.stopPropagation(); // Stop event bubbling

    setDeletingId(productId);

    deleteFavorite(productId, {
      onSuccess: () => {
        toast.success(`${productName} ${t("removed_from_favorites")}`);

        // Navigate to product page after successful deletion
        const productUrl = `${localePrefix}/product/${productId}`;
        router.push(productUrl);

        // Optional: Force a hard refresh if needed
        // window.location.href = productUrl;

        setDeletingId(null);
      },
      onError: (error) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to remove from favorites";
        toast.error(errorMessage);
        setDeletingId(null);
      },
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return <Loader text={t("Loading_my_favorites")} />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  if (items.length === 0) {
    return (
      <div className="w-full h-[18rem] shadow-lg bg-white border font-bold text-red-800 text-xl border-red-600 flex items-center justify-center lg:mt-0 mt-[7rem]">
        {t("No_favorites_yet")}
      </div>
    );
  }

  return (
    <div>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-[1rem] lg:mt-0 mt-[7rem]">
        {items.map((item) => (
          <div key={item.favorite_id} className="block">
            <div className="w-full relative h-[18rem] shadow-lg bg-white p-4">
              <Link href={`${localePrefix}/product/${item.product_id}`}>
                <div className="flex gap-x-4 cursor-pointer">
                  <div className="w-[11rem] h-[16rem] relative">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-[#000000] mt-2 font-bold text-md">
                      {item.name}
                    </h1>
                    <p className="mt-[2.8rem] font-bold text-lg text-[#333333]">
                      {item.price?.formatted ||
                        `${item.price?.symbol || "$"}${item.price?.amount || "0"}`}
                    </p>
                    <div className="text-sm mt-[2rem]">
                      <p className="text-[#666666]">{t("product_code")}:</p>
                      <p className="text-[#000000] font-bold">
                        {item?.product_code}
                      </p>
                    </div>
                    <p className="text-[#666666] text-sm mt-[1rem]">
                      {t("color")}:{" "}
                      <span className="text-[#000000] font-bold">
                        {item?.color?.name}
                      </span>
                    </p>
                    {item.sizes && item.sizes.length > 0 && (
                      <p className="text-[#666666] text-sm mt-[0.5rem]">
                        {t("Sizes")}:{" "}
                        <span className="text-[#000000] font-bold">
                          {item.sizes.map((size) => size.name).join(", ")}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </Link>

              {/* Delete button - Navigates to product after deletion */}
              <div
                className={`absolute cursor-pointer ${locale === "en"?'right-[1rem]':'left-[1rem]'} top-[1rem] z-10`}
                onClick={(e) => handleDelete(item.product_id, item.name, e)}
              >
                {deletingId === item.product_id ? (
                  <div className="w-[15px] h-[15px] border-2 border-red-600 border-t-black rounded-full animate-spin" />
                ) : (
                  <Image
                    width={10}
                    height={10}
                    src="/images/deletefavorite.svg"
                    alt="Delete from favorites"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        onPageChange={handlePageChange}
      />

      {pagination.last_page > 1 && (
        <div className="text-center text-xs text-gray-400 mt-2">
          Page {pagination.current_page} of {pagination.last_page}
        </div>
      )}
    </div>
  );
};

export default FavoriteCard;

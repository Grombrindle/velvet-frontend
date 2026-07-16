import Image from "next/image";
import Line from "../ui/line";

export const AddressCard = ({
  t,
  locale,
  address,
  index,
  onEdit,
  onDelete,
  onSetDefault,
  deleteLoading,
  defaultLoading,
}) => {
  const isDefault = address?.is_default === true;
  const isLoading = defaultLoading === address?.id;

  return (
    <div
      className={`w-full shadow-lg relative flex flex-col space-y-3 lg:h-[18rem] bg-white border ${
        isDefault ? "border-2 border-blue-500" : "border-[#C4C4C4]"
      } px-[1rem] py-[2rem] `}
    >
      <div className="absolute left-1/2 transform -translate-x-1/2 -top-6 w-10 h-10 bg-[#D9D9D9] rounded-full text-black font-bold flex justify-center items-center text-xl">
        {index + 1}
      </div>

      {isDefault && (
        <div className={`absolute top-0 ${locale == "en"?'left-0 rounded-br-lg':'right-0 rounded-bl-lg'} bg-blue-500 text-white px-2 py-1 text-xs `}>
          {t('Default')}
        </div>
      )}

      <div className={`absolute ${locale === "en"?'right-[1rem]':'left-[1rem]'} top-[1rem]`}>
        {deleteLoading === address?.id ? (
          <div className="w-[1rem] h-[1rem] border-2 border-t-transparent border-red-500 rounded-full animate-spin"></div>
        ) : (
          <Image
            src="/images/close.svg"
            alt="delete"
            width={20}
            height={20}
            className="w-[1rem] cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => onDelete(address?.id)}
          />
        )}
      </div>

      <div className="flex items-center gap-2 mt-2">
        <h1 className="font-bold md:text-xl text-lg text-[#000000]">
          {address?.address_title}
        </h1>

        {Array.isArray(address?.type) && address.type.length > 0 && (
          <div className="text-sm bg-gray-200 px-2 py-1">
            <p className="mt-1">{address.type[0]}</p>
          </div>
        )}
      </div>

      {/* Set Default Circle Radio Button */}
      <div className="flex items-center space-x-2 mt-1">
        <button
          onClick={() => !isDefault && !isLoading && onSetDefault(address?.id)}
          disabled={isDefault || isLoading}
          className="flex items-center gap-x-2 focus:outline-none group"
        >
          <div
            className={`
            w-4 h-4 rounded-full flex border-2 items-center justify-center transition-all duration-200
            ${
              isDefault
                ? "bg-[#000000] border-[#000000]"
                : "border-[#000000] bg-white hover:bg-gray-100"
            }
            ${isDefault || isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
          `}
          >
            {isDefault && (
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <span
            className={`
            ml-2 text-sm mt-1 font-medium transition-colors duration-200 
            ${isDefault ? "text-[#000000]" : "text-[#000000] hover:text-gray-700"}
          `}
          >
            {isLoading ? (
              <span className="flex items-center">
                {t('Setting as default')}
                <span className="ml-2 inline-block w-3 h-3 border-2 border-t-transparent border-[#333333] rounded-full animate-spin"></span>
              </span>
            ) : isDefault ? (
              t('Default Address')
            ) : (
              t('Set as Default')
            )}
          </span>
        </button>
      </div>

      <p className="text-md text-[#000000]">
        {address?.name} {address?.sur_name}
      </p>

      <p className="text-md text-[#000000]">
        {address?.country?.name}, {address?.city?.name}, {address?.address}
      </p>

      <p className="text-md text-[#000000]">Phone: {address?.cell_phone}</p>

      <Line mt="" />

      <div className="flex items-center">
        <p
          className="text-[#000000] w-fit cursor-pointer text-md font-bold border-b border-[#000000] hover:text-gray-700 transition-colors"
          onClick={() => onEdit(address)}
        >
          {t('Edit Address')}
        </p>
      </div>
    </div>
  );
};
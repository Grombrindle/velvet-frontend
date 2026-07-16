import { useState } from "react";
import Line from "../ui/line";
import AddressGrid from "./addressGrid";
import Button from "../ui/buttonAddress";
const AddressSuccess = ({ t }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const handleSaveClick = () => {
    setShowSuccess(true);
  };
  // Add these lines
  if (showSuccess) {
    return (
      <div className="w-full">
        <AddressGrid />
      </div>
    );
  }
  return (
    <div className="flex justify-center min-h-screen items-center flex-col">
      <div className="lg:w-[43%] w-[100%]">
        <h1 className="lg:text-4xl md:text-2xl text-xl text-center font-bold text-[#000000]">
          {t("Your_Transaction_Completed")}{" "}
        </h1>
        <Line />
        <p className="lg:text-xl text-lg text-center text-[#525252] mt-4">
          {t("view_changes_on_myaddressespage")}{" "}
        </p>
        <div className="w-full flex justify-center mt-[1rem]">
          <Button onClick={handleSaveClick}>{t("Continue")}</Button>
        </div>
      </div>
    </div>
  );
};
export default AddressSuccess;

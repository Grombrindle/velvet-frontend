"use client";
import { useState } from "react";
import AddressForm from "./addressForm";
import Button from "../ui/buttonAddress";

const AddressCheckout = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col min-h-screen w-full p-4 relative">
      
      {/* Address Form - full width */}
      {showForm && <AddressForm />}

      {/* Add New Address Button - with max-w-md at bottom */}
      {!showForm && (
        <div className="w-full flex justify-center mt-auto mb-[10rem]">
          <Button  onClick={() => setShowForm(true)}>
            Add Address
          </Button>
        </div>
      )}
    </div>
  );
};

export default AddressCheckout;
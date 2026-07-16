"use client";
import Button from "../ui/buttonAddress";
import { useState } from "react";
import AddressForm from "./addressForm";
import AddressFormEdit from "./addressFormEdit";
import AddressSuccess from "./addressSuccess"; // Import this
import toast, { Toaster } from "react-hot-toast";
import DeleteConfirmationPopup from "../ui/deletePopup";
import {
  useAddresses,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "../address/hooks/useAddressQueries";
import { useAddressUIStore } from "@/lib/store";
import { AddressCard } from "./addressCard";
import Loader from "../ui/loader";
import ErrorState from "../ui/errorMessage";
import { useLocale, useTranslations } from "next-intl";

const AddressGrid = () => {
  const t = useTranslations("address");
  const locale = useLocale();
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddSuccess, setShowAddSuccess] = useState(false); // Add this
  const [defaultLoading, setDefaultLoading] = useState(null);

  // React Query hooks
  const { data: addresses = [], isLoading, error, refetch } = useAddresses();

  const addAddressMutation = useAddAddress();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();
  const setDefaultAddressMutation = useSetDefaultAddress();

  // UI State from Zustand
  const { selectedAddress, editFormOpen, openEditForm, closeForms } =
    useAddressUIStore();

  const handleDeleteClick = (id) => {
    setAddressToDelete(id);
    setShowDeletePopup(true);
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;

    try {
      setDeleteLoading(addressToDelete);
      await deleteAddressMutation.mutateAsync(addressToDelete);

      toast.success(t('Address deleted successfully!'), {
        duration: 3000,
        position: "top-center",
        icon: "🗑️",
        style: {
          background: "#10B981",
          color: "#fff",
          fontWeight: "bold",
        },
      });

      setShowDeletePopup(false);
      setAddressToDelete(null);
    } catch (error) {
      toast.error(error.response?.message || t("Failed to delete address"), {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "#fff",
          fontWeight: "bold",
        },
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setAddressToDelete(null);
  };

  const handleEditClick = (address) => {
    openEditForm(address);
  };

  const handleOpenAddForm = () => {
    setShowAddForm(true);
    setShowAddSuccess(false); // Reset success state
    closeForms();
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
    setShowAddSuccess(false);
  };

  const handleCloseAddSuccess = () => {
    setShowAddSuccess(false);
    setShowAddForm(false);
  };

  const handleAddAddress = async (addressData) => {
    try {
      await addAddressMutation.mutateAsync(addressData);
      setShowAddSuccess(true); // Show success screen
      // Don't close the form yet
    } catch (error) {
      // Error will be handled by the form component
      throw error;
    }
  };

  const handleUpdateAddress = async (addressData) => {
    try {
      await updateAddressMutation.mutateAsync({
        id: selectedAddress.id,
        ...addressData,
      });
      closeForms();
    } catch (error) {
      throw error;
    }
  };

  // Handle setting default address
  const handleSetDefault = async (addressId) => {
    try {
      setDefaultLoading(addressId);
      await setDefaultAddressMutation.mutateAsync(addressId);
      toast.success(t('Default address updated successfully!'), {
        duration: 3000,
        position: "top-right",
        icon: "✅",
        style: {
          background: "#10B981",
          color: "#fff",
          fontWeight: "bold",
        },
      });
    } catch (error) {
      toast.error(error.response?.error || t("Failed to set default address"), {
        duration: 4000,
        position: "top-right",
        style: {
          background: "#EF4444",
          color: "#fff",
          fontWeight: "bold",
        },
      });
    } finally {
      setDefaultLoading(null);
    }
  };

  // Show loading state
  if (isLoading) {
    return <Loader text={t('loading_address')} />;
  }

  // Show error state
  if (error) {
    return <ErrorState message={error.message} />;
  }

  // Show add form
  if (showAddForm) {
    // If success should be shown, render AddressSuccess
    if (showAddSuccess) {
      return (
        <div>
          <AddressSuccess t = {t} onClose={handleCloseAddSuccess} />
        </div>
      );
    }

    // Otherwise show the form
    return (
      <div>
        <AddressForm
        t={t}
          onSubmit={handleAddAddress}
          onClose={handleCloseAddForm}
          isLoading={addAddressMutation.isPending}
        />
      </div>
    );
  }

  // Show edit form
  if (editFormOpen && selectedAddress) {
    return (
      <div>
        <AddressFormEdit
        t={t}
          address={selectedAddress}
          onSubmit={handleUpdateAddress}
          onClose={closeForms}
          isLoading={updateAddressMutation.isPending}
        />
      </div>
    );
  }

  // Show addresses grid
  return (
    <div>
      <Toaster />

      <div className="lg:px-[7rem] lg:mt-[1rem] mt-[8rem]">
        <DeleteConfirmationPopup
        t = {t}
          isOpen={showDeletePopup}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          isLoading={deleteLoading === addressToDelete}
          title={t('confirm_delete')}
          message={t('sure_delete_address')}
        />

        <div className="grid lg:grid-cols-2 grid-cols-1 gap-x-[1.5rem] gap-y-[2rem]">
          {addresses.length > 0 &&
            addresses.map((address, index) => (
              <AddressCard
              locale = {locale}
                t={t}
                key={address.id}
                address={address}
                index={index}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onSetDefault={handleSetDefault}
                deleteLoading={deleteLoading}
                defaultLoading={defaultLoading}
              />
            ))}
        </div>

        {/* Only show this button when there are addresses */}
        {addresses.length > 0 ? (
          <div className="flex mt-[2rem] justify-center items-center">
            <Button onClick={handleOpenAddForm}>{t('Add_New_Address')}</Button>
          </div>
        ) : (
          <div className="col-span-full flex justify-center items-center lg:min-h-[32rem]">
            <Button onClick={handleOpenAddForm}>{t('add_address')}</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressGrid;

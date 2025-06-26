"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import SavedAddresses from "@/components/store/saved-addresses";
import { getSavedAddresses } from "@/actions/customers/saved-addresses";

const MyAddresses = () => {
  const {
    data: addressesResult,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["saved-addresses"],
    queryFn: getSavedAddresses,
  });

  const handleSelectAddress = () => {
      
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-900/40 via-purple-800/40 to-purple-900/40 backdrop-blur-md text-white rounded-lg p-6">
        <p>Loading addresses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-blue-900/40 via-purple-800/40 to-purple-900/40 backdrop-blur-md text-white rounded-lg p-6">
        <p className="text-red-300">
          Failed to load addresses. Please try again.
        </p>
      </div>
    );
  }

  const addresses = addressesResult?.success ? addressesResult.data : [];

  return (
    <SavedAddresses
      addresses={addresses || []}
      onSelectAddress={handleSelectAddress}
      cardBg="bg-gradient-to-r from-blue-900/40 via-purple-800/40 to-purple-900/40 backdrop-blur-md text-white"
    />
  );
};

export default MyAddresses;

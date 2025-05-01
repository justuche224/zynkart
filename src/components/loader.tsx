import { Loader as LoadingIcon } from "lucide-react";
import React from "react";

const Loader = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <LoadingIcon size={40} className="animate-spin" />
    </div>
  );
};

export default Loader;

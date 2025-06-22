import React from "react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative w-20 h-20">
        <div className="absolute top-0 left-0 w-full h-full">
          <img
            src="/images/logo.png"
            alt="Loading logo"
            className="w-full h-full object-contain animate-spin"
          />
        </div>
      </div>
    </div>
  );
};

export default Loading;

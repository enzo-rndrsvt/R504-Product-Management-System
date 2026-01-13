import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
};

export default LoadingSpinner;

import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex size-full items-center justify-center">
      <div className="size-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
    </div>
  );
};

export default LoadingSpinner;

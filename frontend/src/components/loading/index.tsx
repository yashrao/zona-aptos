import React from 'react';

interface LoadingProps {
  isMobile: boolean;
}

function Loading({ isMobile }: LoadingProps) {
  return (
    <div
      className={`${isMobile
          ? "flex flex-col items-center justify-center mt-4" // Centered for mobile view
          : "flex items-center justify-center mt-4" // Centered for desktop view
        }`}
    >
      <div className="animate-pulse opacity-20 transition-opacity duration-5000 ease-in-out">
        <img
          src="/images/logo/zona_white.svg" // Replace with your loading icon path
          alt="Loading"
          className="w-24 h-24"
        />
      </div>
    </div>
  );
}

export default Loading;

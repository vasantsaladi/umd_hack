"use client";

import { FC, ReactNode, useState, useEffect } from "react";
import { LoadingAnimation } from "./loading-animation";
import { AnimatePresence } from "framer-motion";

interface ClientLoadingProviderProps {
  children: ReactNode;
}

export const ClientLoadingProvider: FC<ClientLoadingProviderProps> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Force loading screen to show briefly
  useEffect(() => {
    const timer = setTimeout(() => {
      handleLoadingComplete();
    }, 6000); // Ensure it completes after 6 seconds max

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading && <LoadingAnimation onComplete={handleLoadingComplete} />}
      {!isLoading && children}
    </>
  );
};

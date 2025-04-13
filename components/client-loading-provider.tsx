"use client";

import { FC, ReactNode, useState, useEffect } from "react";
import { LoadingAnimation } from "./loading-animation";

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

  // Force loading state to be true on initial render
  useEffect(() => {
    setIsLoading(true);
  }, []);

  return (
    <>
      <LoadingAnimation onComplete={handleLoadingComplete} />
      {children}
    </>
  );
};

import { useEffect } from "react";
import useApiErrorHandler from "./useApiErrorHandler";

const useQueryAuthRecovery = (error) => {
  const handleApiError = useApiErrorHandler();

  useEffect(() => {
    if (error?.response?.status === 401) {
      handleApiError(error);
    }
  }, [error, handleApiError]);
};

export default useQueryAuthRecovery;

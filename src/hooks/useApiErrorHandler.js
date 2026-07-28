import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../store/slices/userSlice";
import { clearAuthToken } from "../utils/localStorage";

const staticServerUri = process.env.REACT_APP_PATH || "";

const useApiErrorHandler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useCallback(
    (error, defaultMessage = "요청을 처리하지 못했습니다. 다시 시도해주세요.", onMessage) => {
      const status = error.response?.status;

      if (status === 401) {
        clearAuthToken();
        dispatch(setUser({ user: null }));
        alert("로그인이 필요한 서비스입니다.");
        navigate(staticServerUri + "/login");
        return;
      }

      if (status === 404) {
        navigate(staticServerUri + "/not-found");
        return;
      }

      const serverMessage = error.response?.data?.error?.message;
      const message = error.response
        ? serverMessage ?? defaultMessage
        : "네트워크 연결을 확인해주세요.";

      if (onMessage) {
        onMessage(message);
        return;
      }

      alert(message);
    },
    [dispatch, navigate]
  );
};

export default useApiErrorHandler;

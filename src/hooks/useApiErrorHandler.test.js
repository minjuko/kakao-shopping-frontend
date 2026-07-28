import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import userReducer from "../store/slices/userSlice";
import useApiErrorHandler from "./useApiErrorHandler";

const wrapper = ({ children }) => {
  const store = configureStore({ reducer: { user: userReducer } });

  return (
    <Provider store={store}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {children}
      </MemoryRouter>
    </Provider>
  );
};

describe("useApiErrorHandler", () => {
  test("서버 오류 메시지를 화면 상태 callback에 전달한다", () => {
    const onMessage = jest.fn();
    const { result } = renderHook(() => useApiErrorHandler(), { wrapper });

    act(() => {
      result.current(
        {
          response: {
            status: 500,
            data: { error: { message: "장바구니 처리에 실패했습니다." } },
          },
        },
        "기본 오류 메시지",
        onMessage
      );
    });

    expect(onMessage).toHaveBeenCalledWith("장바구니 처리에 실패했습니다.");
  });

  test("응답이 없는 네트워크 오류에 안내 메시지를 전달한다", () => {
    const onMessage = jest.fn();
    const { result } = renderHook(() => useApiErrorHandler(), { wrapper });

    act(() => {
      result.current(new Error("Network Error"), "기본 오류 메시지", onMessage);
    });

    expect(onMessage).toHaveBeenCalledWith("네트워크 연결을 확인해주세요.");
  });
});

import { configureStore } from "@reduxjs/toolkit";
import { renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import userReducer, { setUser } from "../store/slices/userSlice";
import { setAuthToken } from "../utils/localStorage";
import useQueryAuthRecovery from "./useQueryAuthRecovery";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const createWrapper = () => {
  const store = configureStore({ reducer: { user: userReducer } });
  store.dispatch(setUser({ user: "Bearer invalid-token" }));

  const wrapper = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {children}
      </MemoryRouter>
    </Provider>
  );

  return { store, wrapper };
};

describe("useQueryAuthRecovery", () => {
  beforeEach(() => {
    localStorage.clear();
    setAuthToken("Bearer invalid-token", 10000);
    mockNavigate.mockClear();
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("query 401이면 token과 Redux 인증을 지우고 로그인으로 이동한다", async () => {
    const { store, wrapper } = createWrapper();

    renderHook(
      () => useQueryAuthRecovery({ response: { status: 401 } }),
      { wrapper }
    );

    await waitFor(() => expect(localStorage.getItem("user")).toBeNull());
    expect(store.getState().user.user).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test.each([
    ["404", { response: { status: 404 } }],
    ["network", new Error("Network Error")],
  ])("query %s 오류는 인증 상태를 변경하지 않는다", async (_name, error) => {
    const { store, wrapper } = createWrapper();

    renderHook(() => useQueryAuthRecovery(error), { wrapper });

    await waitFor(() => expect(mockNavigate).not.toHaveBeenCalled());
    expect(localStorage.getItem("user")).not.toBeNull();
    expect(store.getState().user.user).toBe("Bearer invalid-token");
  });
});

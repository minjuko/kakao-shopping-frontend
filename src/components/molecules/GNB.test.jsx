import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import userReducer from "../../store/slices/userSlice";
import { setAuthToken } from "../../utils/localStorage";
import GNB from "./GNB";
import { getCart } from "../../services/cart";

jest.mock("../../services/cart", () => ({
  getCart: jest.fn(),
}));

const renderGNB = () => {
  const store = configureStore({ reducer: { user: userReducer } });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    store,
    ...render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <GNB />
          </MemoryRouter>
        </QueryClientProvider>
      </Provider>
    ),
  };
};

describe("GNB", () => {
  beforeEach(() => localStorage.clear());
  beforeEach(() => getCart.mockResolvedValue({ products: [] }));

  test("링크를 중첩하지 않고 주요 메뉴를 제공한다", () => {
    renderGNB();

    expect(screen.getByRole("navigation", { name: "주요 메뉴" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "카카오 쇼핑하기 홈" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "장바구니" })).toHaveAttribute("href", "/cart");
    expect(screen.getByRole("link", { name: "로그인" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "회원가입" })).toBeInTheDocument();
    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "상품 카테고리" })).toBeInTheDocument();
    screen.getAllByRole("link").forEach((link) => {
      expect(within(link).queryByRole("link")).not.toBeInTheDocument();
    });
  });

  test("인증 상태에서 로그아웃하면 저장 토큰과 상태를 제거한다", () => {
    setAuthToken("Bearer token", 60_000);
    const { store } = renderGNB();

    fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));

    expect(localStorage.getItem("user")).toBeNull();
    expect(store.getState().user.user).toBeNull();
  });
});

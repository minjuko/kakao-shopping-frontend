import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { getCart, updateCart } from "../../services/cart";
import userReducer from "../../store/slices/userSlice";
import CartList from "./CartList";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../services/cart", () => ({
  getCart: jest.fn(),
  updateCart: jest.fn(),
}));

const cartData = {
  products: [
    {
      id: 1,
      productName: "첫 상품",
      carts: [{
        id: 10,
        quantity: 1,
        option: { optionName: "첫 옵션", price: 1000 },
      }],
    },
    {
      id: 2,
      productName: "둘째 상품",
      carts: [{
        id: 20,
        quantity: 1,
        option: { optionName: "둘째 옵션", price: 2000 },
      }],
    },
  ],
  totalPrice: 3000,
};

const renderCartList = () => {
  const store = configureStore({ reducer: { user: userReducer } });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <CartList />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
};

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

describe("CartList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getCart.mockResolvedValue(cartData);
    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("변경 중인 cart item만 잠그고 완료 후 다시 조작할 수 있다", async () => {
    const firstUpdate = deferred();
    updateCart
      .mockImplementationOnce(() => firstUpdate.promise)
      .mockResolvedValueOnce(cartData);
    renderCartList();

    const increaseButtons = await screen.findAllByRole("button", { name: "수량 늘리기" });
    fireEvent.click(increaseButtons[0]);

    expect(increaseButtons[0]).toBeDisabled();
    expect(increaseButtons[1]).toBeEnabled();
    await waitFor(() => expect(updateCart).toHaveBeenCalledTimes(1));
    fireEvent.click(increaseButtons[0]);
    expect(updateCart).toHaveBeenCalledTimes(1);

    await act(async () => {
      firstUpdate.resolve({
        ...cartData,
        products: [
          {
            ...cartData.products[0],
            carts: [{ ...cartData.products[0].carts[0], quantity: 2 }],
          },
          cartData.products[1],
        ],
      });
    });

    await waitFor(() => expect(increaseButtons[0]).toBeEnabled());
    fireEvent.click(increaseButtons[0]);
    await waitFor(() => expect(updateCart).toHaveBeenCalledTimes(2));
  });

  test("변경 실패 시 optimistic 수량을 rollback한다", async () => {
    const failedUpdate = deferred();
    updateCart.mockImplementation(() => failedUpdate.promise);
    renderCartList();

    const increaseButtons = await screen.findAllByRole("button", { name: "수량 늘리기" });
    const counts = screen.getAllByLabelText("현재 수량");
    fireEvent.click(increaseButtons[0]);
    expect(counts[0]).toHaveTextContent("2");

    await act(async () => {
      failedUpdate.reject({ response: { status: 500 } });
    });

    await waitFor(() => expect(counts[0]).toHaveTextContent("1"));
    expect(increaseButtons[0]).toBeEnabled();
  });

  test("cart query 401이면 저장된 token을 제거한다", async () => {
    localStorage.setItem("user", JSON.stringify({ value: "Bearer invalid" }));
    getCart.mockRejectedValue({ response: { status: 401 } });

    renderCartList();

    await waitFor(() => expect(localStorage.getItem("user")).toBeNull());
  });

  test("일반 장바구니 주문도 선택 상품의 실제 cart ID를 전달한다", async () => {
    renderCartList();

    fireEvent.click(await screen.findByRole("button", { name: "3,000원 주문하기" }));

    expect(mockNavigate).toHaveBeenCalledWith("/order");
  });
});

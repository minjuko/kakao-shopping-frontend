import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { getCart } from "../../services/cart";
import { order } from "../../services/order";
import userReducer from "../../store/slices/userSlice";
import OrderTemplate from "./OrderTemplate";

const mockNavigate = jest.fn();

jest.mock("../../services/cart", () => ({
  getCart: jest.fn(),
}));

jest.mock("../../services/order", () => ({
  order: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const cartData = {
  products: [
    {
      id: 1,
      productName: "테스트 상품",
      carts: [
        {
          id: 10,
          quantity: 2,
          option: { optionName: "기본 옵션", price: 1000 },
        },
      ],
    },
  ],
  totalPrice: 2000,
};

const renderOrderTemplate = (initialEntry = "/order") => {
  const store = configureStore({ reducer: { user: userReducer } });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[initialEntry]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <OrderTemplate />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
};

describe("OrderTemplate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    getCart.mockResolvedValue(cartData);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("배송지를 실제 정보가 아닌 예시 데이터로 안내한다", async () => {
    renderOrderTemplate();

    expect(await screen.findByRole("heading", { name: "배송지 정보" })).toBeInTheDocument();
    expect(screen.getByText("예시 정보")).toBeInTheDocument();
    expect(
      screen.getByText("예시 데이터를 표시합니다. 실제 주문이나 결제는 발생하지 않습니다.")
    ).toBeInTheDocument();
  });

  test("필수 동의 상태에 따라 결제 버튼을 활성화한다", async () => {
    renderOrderTemplate();

    const button = await screen.findByRole("button", { name: "결제하기" });
    expect(button).toBeDisabled();

    fireEvent.click(screen.getByLabelText("구매조건 확인 및 결제 진행 동의"));
    expect(button).toBeDisabled();

    fireEvent.click(screen.getByLabelText("개인정보 제 3자 제공 동의"));
    expect(button).toBeEnabled();

    fireEvent.click(screen.getByLabelText("개인정보 제 3자 제공 동의"));
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(order).not.toHaveBeenCalled();
  });

  test("전체 동의는 결제 버튼을 활성화한다", async () => {
    renderOrderTemplate();
    const button = await screen.findByRole("button", { name: "결제하기" });

    fireEvent.click(screen.getByLabelText("전체 동의"));

    expect(button).toBeEnabled();
  });

  test("수량이 0인 옵션은 주문 상품에서 제외한다", async () => {
    getCart.mockResolvedValue({
      products: [
        {
          ...cartData.products[0],
          carts: [
            ...cartData.products[0].carts,
            {
              id: 11,
              quantity: 0,
              option: { optionName: "제외 옵션", price: 3000 },
            },
          ],
        },
      ],
      totalPrice: 2000,
    });

    renderOrderTemplate();

    expect(await screen.findByText("테스트 상품 기본 옵션")).toBeInTheDocument();
    expect(screen.getAllByText("2,000원")).toHaveLength(3);
    expect(screen.queryByText("테스트 상품 제외 옵션")).not.toBeInTheDocument();
  });

  test("주문 가능한 수량이 없으면 빈 상태를 표시한다", async () => {
    getCart.mockResolvedValue({
      products: [
        {
          ...cartData.products[0],
          carts: [
            {
              ...cartData.products[0].carts[0],
              quantity: 0,
            },
          ],
        },
      ],
      totalPrice: 0,
    });

    renderOrderTemplate();

    expect(await screen.findByText("주문할 상품이 없습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "결제하기" })).not.toBeInTheDocument();
  });

  test("전체 동의 후 주문을 생성하고 주문 완료 페이지로 이동한다", async () => {
    order.mockResolvedValue({ id: 99 });
    renderOrderTemplate();

    fireEvent.click(await screen.findByLabelText("전체 동의"));
    fireEvent.click(screen.getByRole("button", { name: "결제하기" }));

    await waitFor(() => expect(order).toHaveBeenCalledWith(null));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/orders/complete/99"));
  });

  test("navigation product selection과 무관하게 장바구니 전체를 표시한다", async () => {
    getCart.mockResolvedValue({
      products: [
        cartData.products[0],
        {
          id: 2,
          productName: "선택 상품",
          carts: [
            {
              id: 20,
              quantity: 1,
              option: { optionName: "선택 옵션", price: 5000 },
            },
          ],
        },
      ],
      totalPrice: 7000,
    });

    renderOrderTemplate({
      pathname: "/order",
      state: { selectedProductIds: [2] },
    });

    expect(await screen.findByText("선택 상품 선택 옵션")).toBeInTheDocument();
    expect(screen.getByText("테스트 상품 기본 옵션")).toBeInTheDocument();
    expect(screen.getAllByText("7,000원")).toHaveLength(2);
  });

  test("navigation cart selection과 무관하게 장바구니 전체를 표시한다", async () => {
    getCart.mockResolvedValue({
      products: [{
        ...cartData.products[0],
        carts: [
          cartData.products[0].carts[0],
          {
            id: 11,
            quantity: 1,
            option: { optionName: "바로 구매 옵션", price: 3000 },
          },
        ],
      }],
      totalPrice: 5000,
    });

    renderOrderTemplate({
      pathname: "/order",
      state: { selectedCartIds: [11] },
    });

    expect(await screen.findByText("테스트 상품 바로 구매 옵션")).toBeInTheDocument();
    expect(screen.getByText("테스트 상품 기본 옵션")).toBeInTheDocument();
    expect(screen.getAllByText("5,000원")).toHaveLength(2);
  });

  test("주문 요청 중에는 결제 버튼을 비활성화한다", async () => {
    order.mockImplementation(() => new Promise(() => {}));
    renderOrderTemplate();
    fireEvent.click(await screen.findByLabelText("전체 동의"));
    const button = screen.getByRole("button", { name: "결제하기" });

    fireEvent.click(button);

    await waitFor(() => expect(button).toBeDisabled());
    expect(order).toHaveBeenCalledTimes(1);
  });

  test("order query 401이면 token을 제거하고 로그인으로 이동한다", async () => {
    localStorage.setItem("user", JSON.stringify({ value: "Bearer invalid" }));
    getCart.mockRejectedValue({ response: { status: 401 } });

    renderOrderTemplate();

    await waitFor(() => expect(localStorage.getItem("user")).toBeNull());
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});

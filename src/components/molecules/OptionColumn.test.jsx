import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { addCart } from "../../services/cart";
import userReducer from "../../store/slices/userSlice";
import OptionColumn from "./OptionColumn";

const mockNavigate = jest.fn();

jest.mock("../../services/cart", () => ({
  addCart: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const product = {
  options: [
    { id: 101, optionName: "기본 옵션", price: 1000 },
    { id: 102, optionName: "선물 옵션", price: 2000 },
  ],
};

const renderOptionColumn = () => {
  const store = configureStore({ reducer: { user: userReducer } });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <OptionColumn product={product} />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
};

describe("OptionColumn", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("클릭한 옵션을 강조하고 선택 상태로 표시한다", () => {
    renderOptionColumn();
    const optionButton = screen.getByRole("button", { name: /기본 옵션/ });

    fireEvent.click(optionButton);

    expect(optionButton).toHaveClass("bg-yellow-200");
    expect(optionButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("총 수량: 1개")).toBeInTheDocument();
  });

  test("선택 목록에서 옵션을 삭제한다", () => {
    renderOptionColumn();
    fireEvent.click(screen.getByRole("button", { name: /기본 옵션/ }));

    fireEvent.click(screen.getByRole("button", { name: "기본 옵션 삭제" }));

    expect(screen.queryByRole("button", { name: "기본 옵션 삭제" })).not.toBeInTheDocument();
    expect(screen.getByText("총 수량: 0개")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "구매하기" })).toBeDisabled();
  });

  test("선택 옵션을 저장하고 주문 페이지로 이동한다", async () => {
    addCart.mockResolvedValue({});
    renderOptionColumn();
    fireEvent.click(screen.getByRole("button", { name: /선물 옵션/ }));

    fireEvent.click(screen.getByRole("button", { name: "구매하기" }));

    await waitFor(() => expect(addCart).toHaveBeenCalledWith([
      { optionId: 102, quantity: 1 },
    ]));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/order"));
  });
});

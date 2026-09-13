import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { getOrderFromId } from "../../services/order";
import store from "../../store";
import OrderSuccessTemplate from "./OrderSuccessTemplate";

jest.mock("../../services/order", () => ({ getOrderFromId: jest.fn() }));

const renderTemplate = (id) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[`/orders/complete/${id}`]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route
              path="/orders/complete/:id"
              element={<OrderSuccessTemplate />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
};

describe("OrderSuccessTemplate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  test("loads the order result using the route order id", async () => {
    getOrderFromId.mockResolvedValue({
      id: "order-7",
      products: [],
      totalPrice: 0,
    });
    renderTemplate("order-7");

    expect(await screen.findByText(/order-7/)).toBeInTheDocument();
    expect(getOrderFromId).toHaveBeenCalledWith("order-7");
  });

  test("renders an error state for an unknown order id", async () => {
    getOrderFromId.mockRejectedValue({ response: { status: 404 } });
    renderTemplate("missing-order");

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});

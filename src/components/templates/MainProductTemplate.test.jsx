import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { fetchProducts } from "../../services/product";
import MainProductTemplate from "./MainProductTemplate";

jest.mock("../../services/product", () => ({ fetchProducts: jest.fn() }));
jest.mock("react-intersection-observer", () => ({
  useInView: () => ({ ref: jest.fn(), inView: true }),
}));

const makeProducts = (count, offset = 0) =>
  Array.from({ length: count }, (_, index) => ({
    id: offset + index + 1,
    productName: `Product ${offset + index + 1}`,
    image: "/product.png",
    price: 1000,
  }));

const renderTemplate = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MainProductTemplate />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("MainProductTemplate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  test("renders an empty state for an empty first page", async () => {
    fetchProducts.mockResolvedValue([]);
    renderTemplate();

    expect(await screen.findByRole("status")).toBeInTheDocument();
    expect(fetchProducts).toHaveBeenCalledWith(0);
  });

  test("renders an error state when the first page fails", async () => {
    fetchProducts.mockRejectedValue(new Error("network error"));
    renderTemplate();

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  test("requests the next page once and stops after a short page", async () => {
    fetchProducts
      .mockResolvedValueOnce(makeProducts(6))
      .mockResolvedValueOnce(makeProducts(1, 6));
    renderTemplate();

    await waitFor(() => expect(fetchProducts).toHaveBeenCalledTimes(2));
    expect(fetchProducts).toHaveBeenNthCalledWith(1, 0);
    expect(fetchProducts).toHaveBeenNthCalledWith(2, 1);
    await screen.findByText("Product 7");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetchProducts).toHaveBeenCalledTimes(2);
  });
});

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { getProductById } from "../services/product";
import ProductDetailPage from "./ProductDetailPage";

jest.mock("../services/product", () => ({ getProductById: jest.fn() }));
jest.mock("../components/molecules/ProductInformationColumn", () => ({ product }) => (
  <div>{product.productName}</div>
));
jest.mock("../components/molecules/OptionColumn", () => () => <div>options</div>);

describe("ProductDetailPage", () => {
  test("scopes cached product detail data by the route product id", async () => {
    getProductById.mockResolvedValue({ id: 42, productName: "Product 42" });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={["/products/42"]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route path="/products/:id" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText("Product 42")).toBeInTheDocument();
    expect(getProductById).toHaveBeenCalledWith("42");
    await waitFor(() =>
      expect(queryClient.getQueryData(["product", "42"])).toEqual({
        id: 42,
        productName: "Product 42",
      })
    );
  });
});

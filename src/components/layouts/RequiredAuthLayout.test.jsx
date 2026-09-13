import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { clearAuthToken, setAuthToken } from "../../utils/localStorage";
import RequiredAuthLayout from "./RequiredAuthLayout";

jest.mock("../molecules/GNB", () => () => <nav>navigation</nav>);
jest.mock("../atoms/Footer", () => () => <footer>footer</footer>);

const renderRoutes = () =>
  render(
    <MemoryRouter
      initialEntries={["/cart"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route element={<RequiredAuthLayout />}>
          <Route path="/cart" element={<main>protected cart</main>} />
        </Route>
        <Route path="/login" element={<main>login page</main>} />
      </Routes>
    </MemoryRouter>
  );

describe("RequiredAuthLayout", () => {
  afterEach(clearAuthToken);

  test("redirects an unauthenticated visitor away from a protected route", () => {
    renderRoutes();

    expect(screen.getByText("login page")).toBeInTheDocument();
    expect(screen.queryByText("protected cart")).not.toBeInTheDocument();
  });

  test("renders a protected route when a valid token exists", () => {
    setAuthToken("Bearer test-token", 60_000);
    renderRoutes();

    expect(screen.getByText("protected cart")).toBeInTheDocument();
  });
});

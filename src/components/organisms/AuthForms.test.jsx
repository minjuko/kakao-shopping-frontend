import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import userReducer from "../../store/slices/userSlice";
import { login, register } from "../../services/user";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const mockNavigate = jest.fn();

jest.mock("../../services/user", () => ({
  login: jest.fn(),
  register: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const renderWithProviders = (component) => {
  const store = configureStore({
    reducer: { user: userReducer },
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          {component}
        </MemoryRouter>
      </Provider>
    ),
  };
};

const fillLoginForm = () => {
  fireEvent.change(screen.getByLabelText("이메일 (아이디)"), {
    target: { value: "shopper@example.com" },
  });
  fireEvent.change(screen.getByLabelText("비밀번호"), {
    target: { value: "shopper1!" },
  });
};

const fillRegistrationForm = () => {
  fillLoginForm();
  fireEvent.change(screen.getByLabelText("이름"), {
    target: { value: "홍길동" },
  });
  fireEvent.change(screen.getByLabelText("비밀번호 확인"), {
    target: { value: "shopper1!" },
  });
};

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("유효하지 않은 제출은 API 요청 전에 차단한다", () => {
    renderWithProviders(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    expect(login).not.toHaveBeenCalled();
    expect(screen.getAllByRole("alert")).toHaveLength(2);
  });

  test("유효한 폼을 Enter로 제출하고 인증 상태를 저장한다", async () => {
    login.mockResolvedValue({
      headers: { authorization: "Bearer login-token" },
    });
    const { store } = renderWithProviders(<LoginForm />);
    fillLoginForm();

    userEvent.type(screen.getByLabelText("비밀번호"), "{enter}");

    await waitFor(() => expect(login).toHaveBeenCalledTimes(1));
    expect(login).toHaveBeenCalledWith({
      email: "shopper@example.com",
      password: "shopper1!",
    });
    expect(store.getState().user.user).toBe("Bearer login-token");
    expect(JSON.parse(localStorage.getItem("user")).value).toBe("Bearer login-token");
    expect(mockNavigate).toHaveBeenCalledWith("/", {
      replace: true,
      state: { toastMessage: "로그인되었습니다." },
    });
  });

  test("제출 중 버튼을 비활성화해 중복 요청을 막는다", async () => {
    let resolveLogin;
    login.mockImplementation(
      () => new Promise((resolve) => {
        resolveLogin = resolve;
      })
    );
    renderWithProviders(<LoginForm />);
    fillLoginForm();

    const submitButton = screen.getByRole("button", { name: "로그인" });
    fireEvent.click(submitButton);

    await waitFor(() => expect(screen.getByRole("button", { name: "로그인 중..." }).disabled).toBe(true));
    fireEvent.click(screen.getByRole("button", { name: "로그인 중..." }));
    expect(login).toHaveBeenCalledTimes(1);

    resolveLogin({ headers: { authorization: "Bearer login-token" } });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/", {
      replace: true,
      state: { toastMessage: "로그인되었습니다." },
    }));
  });

  test("API 오류 메시지를 화면에 표시한다", async () => {
    login.mockRejectedValue({
      response: { data: { error: { message: "회원 정보가 없습니다." } } },
    });
    renderWithProviders(<LoginForm />);
    fillLoginForm();

    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("회원 정보가 없습니다.");
  });
});

describe("RegisterForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("유효한 회원가입 정보를 제출한다", async () => {
    register.mockResolvedValue({
      headers: { authorization: "Bearer register-token" },
    });
    renderWithProviders(<RegisterForm />);
    fillRegistrationForm();

    fireEvent.click(screen.getByRole("button", { name: "회원가입" }));

    await waitFor(() => expect(register).toHaveBeenCalledTimes(1));
    expect(register).toHaveBeenCalledWith({
      email: "shopper@example.com",
      password: "shopper1!",
      username: "홍길동",
    });
    expect(mockNavigate).toHaveBeenCalledWith("/", {
      replace: true,
      state: { toastMessage: "회원가입이 완료되었습니다." },
    });
  });
});

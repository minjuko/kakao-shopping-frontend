import { render, screen } from "@testing-library/react";
import InputGroup from "./InputGroup";

describe("InputGroup", () => {
  test("label과 입력 필드를 연결한다", () => {
    render(
      <InputGroup
        id="email"
        name="email"
        type="email"
        label="이메일"
        value=""
        onChange={() => {}}
        invalid={{}}
      />
    );

    expect(screen.getByLabelText("이메일").id).toBe("email");
  });

  test("유효성 오류를 입력 필드와 연결해 알린다", () => {
    render(
      <InputGroup
        id="email"
        name="email"
        type="email"
        label="이메일"
        value="invalid"
        onChange={() => {}}
        invalid={{ email: "invalidEmail" }}
      />
    );

    const input = screen.getByLabelText("이메일");
    const error = screen.getByRole("alert");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(error.id);
  });
});

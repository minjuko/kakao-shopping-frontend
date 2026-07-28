import { EMAIL_REGEX, PW_REGEX } from "./regex";

describe("회원 정보 유효성 검사", () => {
  test("올바른 이메일 형식을 구분한다", () => {
    expect(EMAIL_REGEX.test("shopper@example.com")).toBe(true);
    expect(EMAIL_REGEX.test("shopper@example")).toBe(false);
  });

  test("영문, 숫자, 특수문자를 포함한 비밀번호를 허용한다", () => {
    expect(PW_REGEX.test("shopper1!")).toBe(true);
    expect(PW_REGEX.test("password")).toBe(false);
  });
});

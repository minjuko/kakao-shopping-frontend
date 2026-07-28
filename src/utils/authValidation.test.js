import {
  isValidAuthForm,
  validateAuthField,
  validateLogin,
  validateRegistration,
} from "./authValidation";

describe("인증 폼 유효성 검사", () => {
  const validValues = {
    email: "shopper@example.com",
    username: "홍길동",
    password: "shopper1!",
    passwordConfirm: "shopper1!",
  };

  test("빈 필드를 필수 입력 오류로 처리한다", () => {
    expect(validateAuthField("email", "", validValues)).toBe("required");
  });

  test("로그인 필드를 한 번에 검증한다", () => {
    expect(validateLogin(validValues)).toEqual({
      email: true,
      password: true,
    });
  });

  test("회원가입 필드와 비밀번호 확인을 한 번에 검증한다", () => {
    expect(validateRegistration(validValues)).toEqual({
      email: true,
      username: true,
      password: true,
      passwordConfirm: true,
    });
  });

  test("일치하지 않는 비밀번호 확인을 구분한다", () => {
    const result = validateRegistration({
      ...validValues,
      passwordConfirm: "different1!",
    });

    expect(result.passwordConfirm).toBe("invalidConfirmPw");
    expect(isValidAuthForm(result)).toBe(false);
  });
});

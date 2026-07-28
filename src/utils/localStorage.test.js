import {
  clearAuthToken,
  getAuthToken,
  isAuthenticated,
  setAuthToken,
} from "./localStorage";

describe("인증 토큰 저장소", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("유효한 토큰을 저장하고 조회한다", () => {
    setAuthToken("Bearer token", 1000);

    expect(getAuthToken()).toBe("Bearer token");
    expect(isAuthenticated()).toBe(true);
  });

  test("만료된 토큰을 제거한다", () => {
    setAuthToken("Bearer token", -1);

    expect(getAuthToken()).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  test("손상된 저장값을 안전하게 제거한다", () => {
    localStorage.setItem("user", "invalid json");

    expect(getAuthToken()).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  test("로그아웃 시 토큰을 제거한다", () => {
    setAuthToken("Bearer token", 1000);
    clearAuthToken();

    expect(isAuthenticated()).toBe(false);
  });
});

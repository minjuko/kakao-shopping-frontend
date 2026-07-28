import { render, screen } from "@testing-library/react";
import QueryStatus from "./QueryStatus";

describe("QueryStatus", () => {
  test("빈 결과 상태를 status 역할로 표시한다", () => {
    render(<QueryStatus title="상품이 없습니다." message="다시 확인해주세요." />);

    expect(screen.getByRole("status").textContent).toContain("상품이 없습니다.");
    expect(screen.getByText("다시 확인해주세요.")).not.toBeNull();
  });

  test("조회 실패 상태를 alert 역할로 표시한다", () => {
    render(<QueryStatus isError title="조회에 실패했습니다." />);

    expect(screen.getByRole("alert").textContent).toContain("조회에 실패했습니다.");
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import Button from "./Button";

describe("Button", () => {
    test("기본적으로 폼 제출을 발생시키지 않는 button 타입을 사용한다", () => {
        render(<Button>확인</Button>);

        expect(screen.getByRole("button", { name: "확인" })).toHaveAttribute("type", "button");
    });

    test("비활성화 속성을 전달해 클릭을 막는다", () => {
        const handleClick = jest.fn();
        render(
            <Button disabled title="상품을 선택해 주세요" onClick={handleClick}>
                장바구니 담기
            </Button>
        );

        const button = screen.getByRole("button", { name: "장바구니 담기" });
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute("title", "상품을 선택해 주세요");

        fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });
});

import { fireEvent, render, screen } from "@testing-library/react";
import Counter from "./Counter";

describe("Counter", () => {
  test("수량을 늘리고 변경된 값을 전달한다", () => {
    const onIncrease = jest.fn();
    render(<Counter initCount={2} onIncrease={onIncrease} />);

    fireEvent.click(screen.getByRole("button", { name: "수량 늘리기" }));

    expect(screen.getByLabelText("현재 수량").textContent).toBe("3");
    expect(onIncrease).toHaveBeenCalledWith(3);
  });

  test("최소 수량보다 줄일 수 없다", () => {
    const onDecrease = jest.fn();
    render(<Counter initCount={1} onDecrease={onDecrease} />);

    const decreaseButton = screen.getByRole("button", { name: "수량 줄이기" });
    expect(decreaseButton.disabled).toBe(true);
    fireEvent.click(decreaseButton);
    expect(onDecrease).not.toHaveBeenCalled();
  });

  test("최대 수량보다 늘릴 수 없다", () => {
    const onIncrease = jest.fn();
    render(<Counter initCount={3} max={3} onIncrease={onIncrease} />);

    const increaseButton = screen.getByRole("button", { name: "수량 늘리기" });
    expect(increaseButton.disabled).toBe(true);
    fireEvent.click(increaseButton);
    expect(onIncrease).not.toHaveBeenCalled();
  });

  test("상위 컴포넌트가 전달한 수량 변경을 반영한다", () => {
    const { rerender } = render(<Counter initCount={2} />);

    rerender(<Counter initCount={5} />);

    expect(screen.getByLabelText("현재 수량").textContent).toBe("5");
  });
});

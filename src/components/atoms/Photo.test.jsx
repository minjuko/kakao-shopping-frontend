import { fireEvent, render, screen } from "@testing-library/react";
import fallbackImage from "../../assets/image1.png";
import Photo from "./Photo";

describe("Photo", () => {
  test("정상 이미지 src와 대체 텍스트를 유지한다", () => {
    render(<Photo src="/assets/product.jpg" alt="테스트 상품" />);

    expect(screen.getByRole("img", { name: "테스트 상품" })).toHaveAttribute(
      "src",
      "/assets/product.jpg"
    );
  });

  test("이미지 로드 실패 시 로컬 fallback을 한 번 적용한다", () => {
    render(<Photo src="/assets/missing.jpg" alt="테스트 상품" />);
    const image = screen.getByRole("img", { name: "테스트 상품" });

    fireEvent.error(image);
    expect(image).toHaveAttribute("src", fallbackImage);

    fireEvent.error(image);
    expect(image).toHaveAttribute("src", fallbackImage);
    expect(image).toHaveAttribute("alt", "테스트 상품");
  });
});

import {
  addMockCartItems,
  getMockCart,
  getMockOrder,
  resetMockData,
  saveMockOrder,
  updateMockCartItems,
} from "./store";
import { mockProducts } from "./data";

beforeEach(() => resetMockData());

describe("MSW 데모 상태", () => {
  test("상품 응답에 가격, 리뷰, 배송 및 적립 혜택 정보를 포함한다", () => {
    expect(mockProducts).toHaveLength(15);

    mockProducts.forEach((product) => {
      expect(product).toEqual(
        expect.objectContaining({
          originalPrice: expect.any(Number),
          discountRate: expect.any(Number),
          reviewCount: expect.any(Number),
          freeShipping: expect.any(Boolean),
          rewardPoint: expect.any(Number),
          category: expect.any(String),
        })
      );
      expect(product.originalPrice).toBeGreaterThan(product.price);
    });
  });

  test("상품 옵션을 장바구니에 추가하고 수량을 변경한다", () => {
    addMockCartItems([{ optionId: 101, quantity: 2 }]);
    const addedCart = getMockCart();
    expect(addedCart.totalPrice).toBe(25800);

    const cartId = addedCart.products[0].carts[0].id;
    const updatedCart = updateMockCartItems([{ cartId, quantity: 3 }]);
    expect(updatedCart.products[0].carts[0].quantity).toBe(3);
    expect(updatedCart.totalPrice).toBe(38700);
  });

  test("존재하지 않는 옵션은 404 시나리오를 반환한다", () => {
    expect(addMockCartItems([{ optionId: 999, quantity: 1 }])).toEqual({
      error: { status: 404, message: "상품 옵션을 찾을 수 없습니다." },
    });
  });

  test("중복 옵션은 400 시나리오를 반환한다", () => {
    addMockCartItems([{ optionId: 101, quantity: 1 }]);

    expect(addMockCartItems([{ optionId: 101, quantity: 1 }])).toEqual({
      error: { status: 400, message: "이미 장바구니에 담긴 옵션입니다." },
    });
  });

  test("장바구니 상품을 주문 결과로 저장하고 장바구니를 비운다", () => {
    addMockCartItems([{ optionId: 101, quantity: 2 }]);
    const { response } = saveMockOrder();
    const order = getMockOrder(response.id);

    expect(order.totalPrice).toBe(25800);
    expect(order.products[0].items[0].quantity).toBe(2);
    expect(getMockCart().products).toEqual([]);
  });

  test("선택한 장바구니 상품만 주문하고 나머지는 유지한다", () => {
    addMockCartItems([
      { optionId: 101, quantity: 1 },
      { optionId: 201, quantity: 1 },
    ]);
    const cart = getMockCart();
    const selectedCartId = cart.products[1].carts[0].id;
    const { response } = saveMockOrder([selectedCartId]);
    const savedOrder = getMockOrder(response.id);
    const remainingCart = getMockCart();

    expect(savedOrder.products).toHaveLength(1);
    expect(savedOrder.products[0].productName).toBe("황금약단밤 칼집 군밤");
    expect(remainingCart.products).toHaveLength(1);
    expect(remainingCart.products[0].productName).toBe("기본에 크리스마스 슬라이딩 지퍼백");
  });

  test("빈 장바구니 주문은 400 시나리오를 반환한다", () => {
    expect(saveMockOrder()).toEqual({
      error: { status: 400, message: "주문할 상품이 없습니다." },
    });
  });
});

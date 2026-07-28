import {
  addMockCartItems,
  getMockCart,
  getMockOrder,
  resetMockData,
  saveMockOrder,
  updateMockCartItems,
} from "./store";

beforeEach(() => resetMockData());

describe("MSW 데모 상태", () => {
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

  test("빈 장바구니 주문은 400 시나리오를 반환한다", () => {
    expect(saveMockOrder()).toEqual({
      error: { status: 400, message: "주문할 상품이 없습니다." },
    });
  });
});

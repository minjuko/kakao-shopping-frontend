import {
  calculateCartTotal,
  hasCartItems,
  updateCartDataQuantity,
  updateCartItemQuantity,
  upsertCartUpdate,
} from "./cart";

const products = [
  {
    id: 1,
    carts: [
      { id: 10, quantity: 2, option: { price: 1000 } },
      { id: 11, quantity: 1, option: { price: 2500 } },
    ],
  },
];

describe("장바구니 계산", () => {
  test("동일한 장바구니 항목의 수정값을 최신 수량으로 교체한다", () => {
    const updates = [{ cartId: 10, quantity: 2 }];

    expect(upsertCartUpdate(updates, 10, 4)).toEqual([
      { cartId: 10, quantity: 4 },
    ]);
  });

  test("다른 장바구니 항목을 유지하면서 수정값을 추가한다", () => {
    const updates = [{ cartId: 10, quantity: 2 }];

    expect(upsertCartUpdate(updates, 11, 3)).toEqual([
      { cartId: 10, quantity: 2 },
      { cartId: 11, quantity: 3 },
    ]);
  });

  test("선택한 항목의 수량만 불변 방식으로 변경한다", () => {
    const result = updateCartItemQuantity(products, 10, 5);

    expect(result[0].carts[0].quantity).toBe(5);
    expect(result[0].carts[1].quantity).toBe(1);
    expect(result).not.toBe(products);
  });

  test("공유 장바구니 캐시의 수량을 불변 방식으로 변경한다", () => {
    const cartData = { products };
    const result = updateCartDataQuantity(cartData, 10, 5);

    expect(result.products[0].carts[0].quantity).toBe(5);
    expect(result).not.toBe(cartData);
    expect(result.products).not.toBe(products);
  });

  test("모든 상품 옵션의 수량과 가격으로 총금액을 계산한다", () => {
    expect(calculateCartTotal(products)).toBe(4500);
  });

  test("수량이 남은 항목이 있는지 판별한다", () => {
    expect(hasCartItems(products)).toBe(true);
    expect(hasCartItems(updateCartItemQuantity(products, 10, 0))).toBe(true);
    expect(
      hasCartItems(
        updateCartItemQuantity(
          updateCartItemQuantity(products, 10, 0),
          11,
          0
        )
      )
    ).toBe(false);
  });
});

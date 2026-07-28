import { instance } from "./index";
import { addCart, getCart, updateCart } from "./cart";
import { getOrderFromId, order } from "./order";
import { fetchProducts, getProductById } from "./product";

jest.mock("./index", () => ({
  instance: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe("API 서비스 응답 변환", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("상품 목록의 response 데이터와 페이지 파라미터를 전달한다", async () => {
    const products = [{ id: 1, productName: "테스트 상품" }];
    instance.get.mockResolvedValue({ data: { response: products } });

    await expect(fetchProducts(2)).resolves.toEqual(products);
    expect(instance.get).toHaveBeenCalledWith("/products", {
      params: { page: 2 },
    });
  });

  test("상품 상세의 response 데이터만 반환한다", async () => {
    const product = { id: 3, productName: "테스트 상품" };
    instance.get.mockResolvedValue({ data: { response: product } });

    await expect(getProductById(3)).resolves.toEqual(product);
    expect(instance.get).toHaveBeenCalledWith("/products/3");
  });

  test("상품 ID가 없으면 상세 요청을 보내지 않는다", () => {
    expect(() => getProductById()).toThrow("id가 없습니다.");
    expect(instance.get).not.toHaveBeenCalled();
  });

  test("장바구니 조회의 response 데이터만 반환한다", async () => {
    const cart = { products: [], totalPrice: 0 };
    instance.get.mockResolvedValue({ data: { response: cart } });

    await expect(getCart()).resolves.toEqual(cart);
    expect(instance.get).toHaveBeenCalledWith("/carts");
  });

  test("장바구니 추가와 수정 payload를 전달한다", async () => {
    const addPayload = [{ optionId: 1, quantity: 2 }];
    const updatePayload = [{ cartId: 4, quantity: 3 }];
    instance.post
      .mockResolvedValueOnce({ data: { response: { id: 4 } } })
      .mockResolvedValueOnce({ data: { response: { products: [] } } });

    await expect(addCart(addPayload)).resolves.toEqual({ id: 4 });
    await expect(updateCart(updatePayload)).resolves.toEqual({ products: [] });
    expect(instance.post).toHaveBeenNthCalledWith(1, "/carts/add", addPayload);
    expect(instance.post).toHaveBeenNthCalledWith(2, "/carts/update", updatePayload);
  });

  test("주문 생성 결과와 주문 상세의 response 데이터만 반환한다", async () => {
    const orderPayload = { items: [] };
    const savedOrder = { id: 10 };
    const orderDetail = { id: 10, products: [], totalPrice: 0 };
    instance.post.mockResolvedValue({ data: { response: savedOrder } });
    instance.get.mockResolvedValue({ data: { response: orderDetail } });

    await expect(order(orderPayload)).resolves.toEqual(savedOrder);
    await expect(getOrderFromId(10)).resolves.toEqual(orderDetail);
    expect(instance.post).toHaveBeenCalledWith("/orders/save", orderPayload);
    expect(instance.get).toHaveBeenCalledWith("/orders/10");
  });
});

import { mockProducts } from "./data";

let cartItems = [];
let orders = new Map();
let nextCartId = 1;
let nextOrderId = 1;

export const resetMockData = () => {
  cartItems = [];
  orders = new Map();
  nextCartId = 1;
  nextOrderId = 1;
};

const findOption = (optionId) => {
  for (const product of mockProducts) {
    const option = product.options.find((item) => item.id === optionId);
    if (option) {
      return { product, option };
    }
  }
  return null;
};

export const getMockCart = () => {
  const products = mockProducts.flatMap((product) => {
    const carts = cartItems
      .filter((cart) => cart.productId === product.id)
      .map((cart) => ({
        id: cart.id,
        quantity: cart.quantity,
        option: product.options.find((option) => option.id === cart.optionId),
      }));

    return carts.length > 0
      ? [{
          id: product.id,
          productName: product.productName,
          image: product.image,
          freeShipping: product.freeShipping,
          carts,
        }]
      : [];
  });

  const totalPrice = products.reduce(
    (total, product) =>
      total +
      product.carts.reduce(
        (subtotal, cart) => subtotal + cart.option.price * cart.quantity,
        0
      ),
    0
  );

  return { products, totalPrice };
};

export const addMockCartItems = (items) => {
  for (const item of items) {
    const found = findOption(item.optionId);
    if (!found) {
      return { error: { status: 404, message: "상품 옵션을 찾을 수 없습니다." } };
    }
    if (cartItems.some((cart) => cart.optionId === item.optionId)) {
      return { error: { status: 400, message: "이미 장바구니에 담긴 옵션입니다." } };
    }
    cartItems.push({
      id: nextCartId++,
      productId: found.product.id,
      optionId: item.optionId,
      quantity: item.quantity,
    });
  }

  return { response: getMockCart() };
};

export const updateMockCartItems = (updates) => {
  updates.forEach((update) => {
    const cart = cartItems.find((item) => item.id === update.cartId);
    if (cart) {
      cart.quantity = update.quantity;
    }
  });
  cartItems = cartItems.filter((cart) => cart.quantity > 0);
  return getMockCart();
};

export const saveMockOrder = (selectedCartIds) => {
  const selectedIdSet = Array.isArray(selectedCartIds)
    ? new Set(selectedCartIds)
    : null;
  const cart = getMockCart();
  const products = cart.products
    .map((product) => ({
      ...product,
      carts: product.carts.filter(
        (item) => !selectedIdSet || selectedIdSet.has(item.id)
      ),
    }))
    .filter((product) => product.carts.length > 0);

  if (products.length === 0) {
    return { error: { status: 400, message: "주문할 상품이 없습니다." } };
  }

  const id = nextOrderId++;
  const orderProducts = products.map((product) => ({
    productName: product.productName,
    items: product.carts.map((item) => ({
      id: item.id,
      optionName: item.option.optionName,
      quantity: item.quantity,
      price: item.option.price * item.quantity,
    })),
  }));
  const totalPrice = products.reduce(
    (total, product) =>
      total +
      product.carts.reduce(
        (subtotal, item) => subtotal + item.option.price * item.quantity,
        0
      ),
    0
  );
  orders.set(id, { id, products: orderProducts, totalPrice });
  cartItems = selectedIdSet
    ? cartItems.filter((item) => !selectedIdSet.has(item.id))
    : [];
  return { response: { id } };
};

export const getMockOrder = (id) => orders.get(Number(id));

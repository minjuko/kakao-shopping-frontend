export const upsertCartUpdate = (updates, cartId, quantity) => [
  ...updates.filter((item) => item.cartId !== cartId),
  { cartId, quantity },
];

export const updateCartItemQuantity = (products, cartId, quantity) =>
  products.map((product) => ({
    ...product,
    carts: product.carts.map((cart) =>
      cart.id === cartId ? { ...cart, quantity } : cart
    ),
  }));

export const updateCartDataQuantity = (cartData, cartId, quantity) =>
  cartData
    ? {
        ...cartData,
        products: updateCartItemQuantity(
          cartData.products ?? [],
          cartId,
          quantity
        ),
      }
    : cartData;

export const calculateCartTotal = (products) =>
  products.reduce(
    (productTotal, product) =>
      productTotal +
      product.carts.reduce(
        (optionTotal, cart) =>
          optionTotal + cart.option.price * cart.quantity,
        0
      ),
    0
  );

export const hasCartItems = (products) =>
  products.some((product) =>
    product.carts.some((cart) => cart.quantity > 0)
  );

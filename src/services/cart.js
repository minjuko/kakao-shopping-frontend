import { instance } from "./index";

export const addCart = (payload) => {
  return instance.post("/carts/add", payload).then(({ data }) => data.response);
};

export const getCart = () => {
  return instance.get("/carts").then(({ data }) => data.response);
};

/**
 * 장바구니 아이디와 수량을 받아서 업데이트를 진행
 * @param {object} items: cartId, quantity
 */
export const updateCart = (items) => {
  return instance.post("/carts/update", items).then(({ data }) => data.response);
};

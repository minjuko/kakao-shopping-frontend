import React from "react";
import Box from "./Box";
import { comma } from "../../utils/convert";
import Counter from "./Counter";
import Button from "./Button";

const CartItem = ({ item, onChange, onDelete }) => {
  return (
    <Box className="mt-4 w-full rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
      <h5 className="mb-4 text-lg font-bold">{item.productName}</h5>
      {item.carts.map((cart) => (
          cart.quantity > 0 ? (
        <div key={cart.id} className="cart">
          <div className="option my-3 rounded-xl bg-gray-50 p-4">
            <div className="option-name mb-3 font-medium">{cart.option.optionName}</div>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-600 hover:border-red-300 hover:text-red-600"
                  onClick={() => {
                    onDelete(cart.id)
                  }}
                >
                  삭제
                </Button>
                <Counter
                  initCount={cart.quantity}
                  onIncrease={(count) => {
                    onChange(cart.id, count);
                  }}
                  onDecrease={(count) => {
                    onChange(cart.id, count);
                  }}
                ></Counter>
              </div>
              <div className="price font-bold">
                <span>{comma(cart.option.price * cart.quantity)}원</span>
              </div>
            </div>
          </div>
        </div>
          ):null
      ))}
      <div className="total-price">
        <div className="row mt-4 flex w-auto justify-between border-t px-1 pt-4">
          <h5 className="text-sm text-gray-600">상품 합계</h5>
          <div className="price font-bold">
            {comma(
              item.carts.reduce((acc, cur) => {
                return acc + cur.option.price * cur.quantity;
              }, 0)
            )}
            원
          </div>
        </div>
      </div>
    </Box>
  );
};

export default CartItem;

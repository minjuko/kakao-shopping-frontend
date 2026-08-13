import React from "react";
import Box from "./Box";
import { comma } from "../../utils/convert";
import Counter from "./Counter";
import DeleteButton from "./DeleteButton";

const staticServerUri = process.env.REACT_APP_PATH || "";

const CartItem = ({
  item,
  onChange,
  onDelete,
  selected = true,
  showSelection = false,
  onSelect,
  updatingCartIds = [],
}) => {
  return (
    <Box className={`w-full rounded-2xl border bg-white p-3 shadow-md transition sm:p-4 ${
      selected ? "border-gray-200" : "border-gray-200 opacity-60"
    }`}>
      <div className="mb-4 flex items-center gap-4 border-b border-gray-100 pb-4">
        {showSelection && (
          <input
            type="checkbox"
            className="h-5 w-5 shrink-0 accent-yellow-400"
            checked={selected}
            onChange={(event) => onSelect(item.id, event.target.checked)}
            aria-label={`${item.productName} 선택`}
          />
        )}
        {item.image && (
          <img
            src={`${staticServerUri}/assets${item.image}`}
            alt=""
            className="h-20 w-20 rounded-xl object-cover"
          />
        )}
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold text-yellow-600">톡딜 상품</p>
          <h2 className="font-bold leading-snug">{item.productName}</h2>
          <p className="mt-1 text-xs font-medium text-gray-500">무료배송</p>
        </div>
      </div>
      {item.carts.map((cart) => (
          cart.quantity > 0 ? (
        <div key={cart.id} className="cart">
          <div className="option my-3 rounded-xl bg-gray-50 p-4">
            <div className="option-name mb-3 font-medium">{cart.option.optionName}</div>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-2">
                <Counter
                  initCount={cart.quantity}
                  disabled={updatingCartIds.includes(cart.id)}
                  onIncrease={(count) => {
                    onChange(cart.id, count);
                  }}
                  onDecrease={(count) => {
                    onChange(cart.id, count);
                  }}
                ></Counter>
                <DeleteButton
                  label={cart.option.optionName}
                  disabled={updatingCartIds.includes(cart.id)}
                  onClick={() => {
                    onDelete(cart.id)
                  }}
                />
              </div>
              <div className="price pr-1 font-bold">
                <span>{comma(cart.option.price * cart.quantity)}원</span>
              </div>
            </div>
          </div>
        </div>
          ):null
      ))}
      <div className="total-price">
        <div className="row mt-4 flex w-auto items-center justify-between border-t px-4 pt-4">
          <h3 className="text-sm text-gray-600">상품 합계</h3>
          <div className="price pr-1 font-bold">
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

import React, { useLayoutEffect, useRef, useState } from "react";
import Container from "../atoms/Container";
import Box from "../atoms/Box";
import CartItem from "../atoms/CartItem";
import Button from "../atoms/Button";
import { useNavigate } from "react-router-dom";
import { comma } from "../../utils/convert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCart, updateCart } from "../../services/cart";
import Title from "../atoms/Title";
import { queryKeys } from "../../services/queryKeys";
import useApiErrorHandler from "../../hooks/useApiErrorHandler";
import Loader from "../atoms/Loader";
import QueryStatus from "../atoms/QueryStatus";
import {
  calculateCartTotal,
  hasCartItems,
  updateCartDataQuantity,
  updateCartItemQuantity,
} from "../../utils/cart";
import useQueryAuthRecovery from "../../hooks/useQueryAuthRecovery";

const staticServerUri = process.env.REACT_APP_PATH || "";

const CartList = () => {
  /**
   * 장바구니 조회 API 에러 캐칭 시나리오
   * 1. 401: 보호 라우트에서 미인증 사용자를 로그인 페이지로 이동시킨다.
   * 2. 네트워크 및 서버 오류: 장바구니 조회 실패 상태를 표시한다.
   * 3. 정상 응답에 상품이 없는 경우: 장바구니가 비었다는 상태를 표시한다.
   */
  const { data, error, isLoading, isError } = useQuery(queryKeys.cart, getCart);
  useQueryAuthRecovery(error);
  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const handleApiError = useApiErrorHandler();

  const [cartItems, setCartItems] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const updatingCartIdsRef = useRef(new Set());
  const [updatingCartIds, setUpdatingCartIds] = useState([]);

  /**
   * 장바구니 수정 API 에러 캐칭 시나리오
   * 1. 401: 인증 정보를 제거하고 로그인 페이지로 이동한다.
   * 2. 404: 존재하지 않는 리소스로 판단하고 404 페이지로 이동한다.
   * 3. 네트워크 오류: 사용자에게 네트워크 연결 확인을 안내한다.
   * 4. 그 외 서버 오류: 장바구니 수정 실패 메시지를 안내한다.
   *
   * 상태 코드별 공통 동작은 useApiErrorHandler에서 처리한다.
   */
  const { mutate, isLoading: isUpdating } = useMutation({
    mutationFn: updateCart,
    onMutate: async ([update]) => {
      await queryClient.cancelQueries(queryKeys.cart);

      const previousCart = queryClient.getQueryData(queryKeys.cart);
      const optimisticCart = updateCartDataQuantity(
        previousCart,
        update.cartId,
        update.quantity
      );

      queryClient.setQueryData(queryKeys.cart, optimisticCart);
      setCartItems(optimisticCart?.products ?? []);

      return { previousCart };
    },
    onError: (error, _updates, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart, context.previousCart);
        setCartItems(context.previousCart.products ?? []);
      }

      handleApiError(
        error,
        "장바구니를 수정하지 못했습니다.",
        setFeedbackMessage
      );
    },
    onSuccess: (updatedCart) => {
      if (updatedCart?.products) {
        queryClient.setQueryData(queryKeys.cart, updatedCart);
        setCartItems(updatedCart.products);
      }
    },
    onSettled: (_data, _error, [update]) => {
      updatingCartIdsRef.current.delete(update.cartId);
      setUpdatingCartIds(Array.from(updatingCartIdsRef.current));
      queryClient.invalidateQueries(queryKeys.cart);
    },
  });

  useLayoutEffect(() => {
    if (!data) {
      return;
    }
    setCartItems(data.products);
  }, [data]);

  const handleOnChangeCount = (cartId, quantity) => {
    if (updatingCartIdsRef.current.has(cartId)) {
      return;
    }
    updatingCartIdsRef.current.add(cartId);
    setUpdatingCartIds(Array.from(updatingCartIdsRef.current));
    setFeedbackMessage("");
    setCartItems((prev) => updateCartItemQuantity(prev, cartId, quantity));
    mutate([{ cartId, quantity }]);
  };

  const handleOnDeleteOption = (cartId) => {
    if (updatingCartIdsRef.current.has(cartId)) {
      return;
    }
    updatingCartIdsRef.current.add(cartId);
    setUpdatingCartIds(Array.from(updatingCartIdsRef.current));
    setFeedbackMessage("");
    setCartItems((prev) => updateCartItemQuantity(prev, cartId, 0));
    mutate([{ cartId, quantity: 0 }]);
  };

  const handleOrder = () => {
    setFeedbackMessage("");

    if (!isUpdating) {
      navigate(staticServerUri + "/order");
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <QueryStatus
        isError
        title="장바구니를 불러오지 못했습니다."
        message="잠시 후 다시 시도해주세요."
      />
    );
  }

  if (!hasCartItems(cartItems)) {
    return (
      <QueryStatus
        title="장바구니가 비어 있습니다."
        message="원하는 상품을 장바구니에 담아보세요."
      />
    );
  }

  const visibleCartItems = cartItems.filter((item) =>
    item.carts.some((cart) => cart.quantity > 0)
  );
  const selectedTotal = calculateCartTotal(visibleCartItems);

  return (
    <Container className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <Box>
          <Title className="mb-1">장바구니</Title>
          <p className="text-sm text-gray-500">
            옵션과 수량을 확인한 뒤 주문을 진행해주세요.
          </p>
        </Box>
        <ol className="flex items-center gap-2 text-xs text-gray-400" aria-label="주문 단계">
          <li className="font-bold text-gray-900">01 장바구니</li>
          <li aria-hidden="true">›</li>
          <li>02 주문·결제</li>
          <li aria-hidden="true">›</li>
          <li>03 완료</li>
        </ol>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <div className="space-y-4">
          {Array.isArray(visibleCartItems) &&
            visibleCartItems
              .map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onChange={handleOnChangeCount}
                  onDelete={handleOnDeleteOption}
                  updatingCartIds={updatingCartIds}
                />
              ))}
        </div>

        <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">결제 예정 금액</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">상품 금액</dt>
              <dd>{comma(selectedTotal)}원</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">배송비</dt>
              <dd className="font-medium text-gray-700">무료배송</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-end justify-between border-t pt-5">
            <span className="text-base font-bold">총 상품 금액</span>
            <strong className="text-2xl">{comma(selectedTotal)}원</strong>
          </div>
          <p className="mt-3 rounded-lg bg-yellow-50 p-3 text-xs text-gray-600">
            카카오페이 결제 시 상품별 포인트 혜택을 받을 수 있습니다.
          </p>
          <Button
            className="mt-4 h-14 w-full rounded-xl bg-yellow-300 p-3 text-center font-bold hover:bg-yellow-400"
            onClick={handleOrder}
            disabled={isUpdating}
          >
            <span>
              {isUpdating
                ? "수량 변경 저장 중..."
                : `${comma(selectedTotal)}원 주문하기`}
            </span>
          </Button>
          {feedbackMessage && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {feedbackMessage}
            </p>
          )}
        </aside>
      </div>
    </Container>
  );
};

export default CartList;

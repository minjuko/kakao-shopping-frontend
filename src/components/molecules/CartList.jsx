import React, { useEffect, useState } from "react";
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
  updateCartItemQuantity,
  upsertCartUpdate,
} from "../../utils/cart";

const staticServerUri = process.env.REACT_APP_PATH || "";

const CartList = () => {
  /**
   * 장바구니 조회 API 에러 캐칭 시나리오
   * 1. 401: 보호 라우트에서 미인증 사용자를 로그인 페이지로 이동시킨다.
   * 2. 네트워크 및 서버 오류: 장바구니 조회 실패 상태를 표시한다.
   * 3. 정상 응답에 상품이 없는 경우: 장바구니가 비었다는 상태를 표시한다.
   */
  const { data, isLoading, isError } = useQuery(queryKeys.cart, getCart);
  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const handleApiError = useApiErrorHandler();

  const [cartItems, setCartItems] = useState([]);
  const [updatePayload, setUpdatePayload] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  /**
   * 장바구니 수정 API 에러 캐칭 시나리오
   * 1. 401: 인증 정보를 제거하고 로그인 페이지로 이동한다.
   * 2. 404: 존재하지 않는 리소스로 판단하고 404 페이지로 이동한다.
   * 3. 네트워크 오류: 사용자에게 네트워크 연결 확인을 안내한다.
   * 4. 그 외 서버 오류: 장바구니 수정 실패 메시지를 안내한다.
   *
   * 상태 코드별 공통 동작은 useApiErrorHandler에서 처리한다.
   */
  const { mutate } = useMutation({
    mutationFn: updateCart,
    onError: (error) => handleApiError(
      error,
      "장바구니를 수정하지 못했습니다.",
      setFeedbackMessage
    ),
  });

  useEffect(() => {
    if (!data) {
      return;
    }
    setCartItems(data.products);
  }, [data]);

  const handleOnChangeCount = (cartId, quantity) => {
    setUpdatePayload((prev) => upsertCartUpdate(prev, cartId, quantity));
    setCartItems((prev) => updateCartItemQuantity(prev, cartId, quantity));
  };

  const handleOnDeleteOption = (cartId) => {
    setUpdatePayload((prev) => upsertCartUpdate(prev, cartId, 0));
    setCartItems((prev) => updateCartItemQuantity(prev, cartId, 0));
  };

  const handleOrder = () => {
    setFeedbackMessage("");

    if (updatePayload.length === 0) {
      navigate(staticServerUri + "/order");
      return;
    }

    mutate(updatePayload, {
      onSuccess: async () => {
        await queryClient.invalidateQueries(queryKeys.cart);
        navigate(staticServerUri + "/order");
      },
    });
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

  return (
    <Container className="mx-auto w-full max-w-[1024px] px-4 py-8">
      <Box>
        <Title>장바구니</Title>
      </Box>
      <div>
        {Array.isArray(cartItems) &&
          cartItems
            .filter((item) => item.carts.some((cart) => cart.quantity > 0))
            .map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onChange={handleOnChangeCount}
                onDelete={handleOnDeleteOption}
              />
            ))}
      </div>
      <div className="mt-4 flex justify-between rounded border p-4">
          <div>주문 예상 금액</div>
          <div className="font-bold text-blue-600">
            {comma(calculateCartTotal(cartItems))}원
          </div>
        </div>
      
      <Button
        className="mt-6 w-full rounded-md bg-yellow-300 p-3 text-center font-bold"
        onClick={handleOrder}
      >
        <span>주문하기</span>
      </Button>
      {feedbackMessage && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {feedbackMessage}
        </p>
      )}
    </Container>
  );
};

export default CartList;

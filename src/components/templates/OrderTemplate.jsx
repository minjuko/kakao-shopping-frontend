import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { comma } from "../../utils/convert";
import { order } from "../../services/order";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getCart } from "../../services/cart";
import { queryKeys } from "../../services/queryKeys";
import useApiErrorHandler from "../../hooks/useApiErrorHandler";
import Loader from "../atoms/Loader";
import QueryStatus from "../atoms/QueryStatus";

const staticServerUri = process.env.REACT_APP_PATH || "";
const demoShippingAddress = {
  recipient: "예시 사용자",
  phone: "010-0000-0000",
  address: "서울특별시 강남구 테헤란로 000 (예시)",
};

const OrderItems = ({ products }) => (
  <>
    {products.flatMap((item) =>
      item.carts
        .filter((cart) => cart.quantity > 0)
        .map((cart) => (
          <div key={cart.id} className="border-t p-4">
            <div className="product-name">
              <span>
                {`${item.productName} ${cart.option.optionName}`}
              </span>
            </div>
            <div className="quantity">
              <span>{comma(cart.quantity)}개</span>
            </div>
            <div className="price">
              <span>{comma(cart.option.price * cart.quantity)}원</span>
            </div>
          </div>
        ))
    )}
  </>
);

const OrderTemplate = () => {
  /**
   * 주문 대상 장바구니 조회 API 에러 캐칭 시나리오
   * 1. 401: 보호 라우트에서 미인증 사용자를 로그인 페이지로 이동시킨다.
   * 2. 네트워크 및 서버 오류: 주문 정보 조회 실패 상태를 표시한다.
   * 3. 정상 응답에 상품이 없는 경우: 주문할 상품이 없다는 상태를 표시한다.
   */
  const { data, isLoading, isError } = useQuery(queryKeys.cart, getCart);
  const { products = [], totalPrice = 0 } = data ?? {};
  const hasOrderItems = products.some((product) =>
    product.carts.some((cart) => cart.quantity > 0)
  );
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const handleApiError = useApiErrorHandler();
  const [agreePayment, setAgreePayment] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleAllAgree = (e) => {
    const value = e.target.checked;
    setAgreePayment(value);
    setAgreePolicy(value);
  };

  const handleAgreement = (e) => {
    const { name, checked } = e.target;

    if (name === "payment-agree") {
      setAgreePayment(checked);
    } else if (name === "policy-agree") {
      setAgreePolicy(checked);
    }
  };

  /**
   * 주문 생성 API 에러 캐칭 시나리오
   * 1. 401: 인증 정보를 제거하고 로그인 페이지로 이동한다.
   * 2. 404: 주문 대상 리소스를 찾을 수 없는 경우 404 페이지로 이동한다.
   * 3. 네트워크 오류: 사용자에게 네트워크 연결 확인을 안내한다.
   * 4. 그 외 서버 오류: 주문 실패 메시지와 재시도를 안내한다.
   *
   * 상태 코드별 공통 동작은 useApiErrorHandler에서 처리한다.
   */
  const { mutate, isLoading: isOrdering } = useMutation({
    mutationFn: order,
    onError: (error) => handleApiError(
      error,
      "주문에 실패했습니다. 다시 시도해주세요.",
      setFeedbackMessage
    ),
  });

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <QueryStatus
        isError
        title="주문 정보를 불러오지 못했습니다."
        message="장바구니를 확인한 뒤 다시 시도해주세요."
      />
    );
  }

  if (!hasOrderItems) {
    return (
      <QueryStatus
        title="주문할 상품이 없습니다."
        message="장바구니에 상품을 담은 뒤 주문해주세요."
      />
    );
  }

  return (
    <div className="px-4 py-8">
      <div className="mx-auto block w-full max-w-[1024px]">
        <div className="border p-2">
          <h1 className="text-md font-bold">주문하기</h1>
        </div>
        <section className="border p-4" aria-labelledby="shipping-address-title">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="shipping-address-title" className="text-md font-bold">
              배송지 정보
            </h2>
            <span className="rounded-md bg-blue-100 p-1 text-xs text-blue-700">
              예시 정보
            </span>
          </div>
          <p className="mt-2 rounded bg-gray-100 p-3 text-sm text-gray-600">
            예시 데이터를 표시합니다. 실제 주문이나 결제는 발생하지 않습니다.
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-[100px_1fr]">
            <dt className="font-bold">받는 분</dt>
            <dd>{demoShippingAddress.recipient}</dd>
            <dt className="font-bold">연락처</dt>
            <dd>{demoShippingAddress.phone}</dd>
            <dt className="font-bold">주소</dt>
            <dd>{demoShippingAddress.address}</dd>
          </dl>
        </section>

        <div className="border p-4">
          <h2>주문상품 정보</h2>
        </div>
  
        <OrderItems products={products} />
        <div className="border p-4 flex items-center justify-between">
          <h3>총 주문 금액</h3>
          <span className="price text-indigo-600 font-bold">
            {comma(totalPrice)}원
          </span>
        </div>
        <div className="border flex flex-col p-4 gap-4">
          <div className="flex gap-2">
            <input
              type="checkbox"
              id="all-agree"
              checked={agreePayment && agreePolicy}
              onChange={handleAllAgree}
            />
            <label htmlFor="all-agree" className="text-xl font-bold">
              전체 동의
            </label>
          </div>
          <div className="flex gap-2">
            <input
              type="checkbox"
              id="agree"
              name="payment-agree"
              checked={agreePayment}
              onChange={handleAgreement}
            />
            <label htmlFor="agree" className="text-sm">
              구매조건 확인 및 결제 진행 동의
            </label>
          </div>
          <div className="flex gap-2">
            <input
              type="checkbox"
              id="policy"
              name="policy-agree"
              checked={agreePolicy}
              onChange={handleAgreement}
            />
            <label htmlFor="policy" className="text-sm">
              개인정보 제 3자 제공 동의
            </label>
          </div>
          <button
            onClick={() => {
              if (!agreePayment || !agreePolicy) {
                setFeedbackMessage("모든 항목에 동의해야 합니다.");
                return;
              }

              setFeedbackMessage("");
              mutate(null, {
                onSuccess: async (res) => {
                  await queryClient.invalidateQueries(queryKeys.cart);
                  const id = res.id;
                  navigate(staticServerUri + "/orders/complete/" + id);
                },
              });
            }}
            disabled={isOrdering}
            className={`w-full p-4 font-medium ${
              agreePayment && agreePolicy && !isOrdering ? "bg-yellow-300" : "bg-gray-300"
            }`}
          >
            {isOrdering ? "결제 처리 중..." : "결제하기"}
          </button>
          {feedbackMessage && (
            <p className="text-sm text-red-600" role="alert">
              {feedbackMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTemplate;

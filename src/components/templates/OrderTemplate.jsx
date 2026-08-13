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
import { calculateCartTotal } from "../../utils/cart";
import useQueryAuthRecovery from "../../hooks/useQueryAuthRecovery";

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
          <div key={cart.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="product-name font-medium">
              <span>
                {`${item.productName} ${cart.option.optionName}`}
              </span>
            </div>
            <div className="quantity mt-2 text-sm text-gray-500">
              <span>{comma(cart.quantity)}개</span>
            </div>
            <div className="price mt-1 font-bold">
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
  const { data, error, isLoading, isError } = useQuery(queryKeys.cart, getCart);
  useQueryAuthRecovery(error);
  const { products = [] } = data ?? {};
  const orderProducts = products.filter((product) => product.carts.length > 0);
  const totalPrice = calculateCartTotal(orderProducts);
  const hasOrderItems = orderProducts.some((product) =>
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
    <div className="px-4 py-8 sm:px-6 lg:py-10">
      <div className="mx-auto block w-full max-w-[1200px]">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">주문·결제</h1>
            <p className="mt-1 text-sm text-gray-500">
              배송 정보와 결제 내용을 확인해주세요.
            </p>
          </div>
          <ol className="flex items-center gap-2 text-xs text-gray-400" aria-label="주문 단계">
            <li>01 장바구니</li>
            <li aria-hidden="true">›</li>
            <li className="font-bold text-gray-900">02 주문·결제</li>
            <li aria-hidden="true">›</li>
            <li>03 완료</li>
          </ol>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
          <div className="space-y-4">
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-md" aria-labelledby="shipping-address-title">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="shipping-address-title" className="font-bold">
              배송지 정보
            </h2>
            <span className="rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
              예시 정보
            </span>
          </div>
          <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
            예시 데이터를 표시합니다. 실제 주문이나 결제는 발생하지 않습니다.
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-[100px_1fr]">
            <dt className="text-gray-500">받는 분</dt>
            <dd>{demoShippingAddress.recipient}</dd>
            <dt className="text-gray-500">연락처</dt>
            <dd>{demoShippingAddress.phone}</dd>
            <dt className="text-gray-500">주소</dt>
            <dd>{demoShippingAddress.address}</dd>
          </dl>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-md" aria-labelledby="order-products-title">
          <h2 id="order-products-title" className="font-bold">주문상품 정보</h2>
          <div className="mt-4 space-y-3">
            <OrderItems products={orderProducts} />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-md" aria-labelledby="payment-method-title">
          <h2 id="payment-method-title" className="font-bold">결제수단</h2>
          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border-2 border-yellow-300 bg-yellow-50 p-4">
            <input
              type="radio"
              name="payment-method"
              value="kakaopay"
              checked
              readOnly
              className="h-4 w-4 accent-yellow-400"
            />
            <span className="flex-1">
              <strong className="block text-base">kakao<span className="font-black">pay</span></strong>
              <span className="mt-1 block text-xs text-gray-500">
                카카오페이 머니 또는 등록한 카드로 간편 결제
              </span>
            </span>
            <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold">
              최대 1% 적립
            </span>
          </label>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-md" aria-labelledby="agreement-title">
          <h2 id="agreement-title" className="sr-only">주문 동의</h2>
          <div className="flex items-center gap-3 border-b pb-4">
            <input
              className="h-5 w-5 accent-yellow-400"
              type="checkbox"
              id="all-agree"
              checked={agreePayment && agreePolicy}
              onChange={handleAllAgree}
            />
            <label htmlFor="all-agree" className="text-lg font-bold">
              전체 동의
            </label>
            <span className="ml-auto text-xs text-gray-400">주문 내용을 확인했습니다.</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              className="h-4 w-4 accent-yellow-400"
              type="checkbox"
              id="agree"
              name="payment-agree"
              checked={agreePayment}
              onChange={handleAgreement}
            />
            <label htmlFor="agree" className="text-sm text-gray-600">
              구매조건 확인 및 결제 진행 동의
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              className="h-4 w-4 accent-yellow-400"
              type="checkbox"
              id="policy"
              name="policy-agree"
              checked={agreePolicy}
              onChange={handleAgreement}
            />
            <label htmlFor="policy" className="text-sm text-gray-600">
              개인정보 제 3자 제공 동의
            </label>
          </div>
        </section>
        </div>

        <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">최종 결제 금액</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">상품 금액</dt>
              <dd>{comma(totalPrice)}원</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">배송비</dt>
              <dd className="font-medium text-gray-700">무료배송</dd>
            </div>
            <div className="flex justify-between text-yellow-700">
              <dt>카카오페이 예상 적립</dt>
              <dd>결제 후 적립</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-end justify-between border-t pt-5">
            <span className="text-base font-bold">총 상품 금액</span>
            <strong className="text-2xl">{comma(totalPrice)}원</strong>
          </div>
          <p className="mt-3 rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
            결제하기를 누르면 선택한 결제수단으로 주문이 진행됩니다. 데모 환경에서는 실제 결제가 발생하지 않습니다.
          </p>
          <button
            type="button"
            aria-label="결제하기"
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
            disabled={!agreePayment || !agreePolicy || isOrdering}
            className={`mt-4 w-full rounded-xl p-4 font-bold ${
              agreePayment && agreePolicy && !isOrdering ? "bg-yellow-300 hover:bg-yellow-400" : "bg-gray-200 text-gray-500"
            }`}
          >
            {isOrdering ? "결제 처리 중..." : `${comma(totalPrice)}원 결제하기`}
          </button>
          {feedbackMessage && (
            <p className="text-sm text-red-600" role="alert">
              {feedbackMessage}
            </p>
          )}
        </aside>
        </div>
      </div>
    </div>
  );
};

export default OrderTemplate;

import { useQuery } from "@tanstack/react-query";
import { comma } from "../../utils/convert";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderFromId } from "../../services/order";
import Title from "../atoms/Title";
import Box from "../atoms/Box";
import Button from "../atoms/Button";
import { queryKeys } from "../../services/queryKeys";
import Loader from "../atoms/Loader";
import QueryStatus from "../atoms/QueryStatus";
import useQueryAuthRecovery from "../../hooks/useQueryAuthRecovery";

const staticServerUri = process.env.REACT_APP_PATH || "";

const OrderSuccessTemplate = () => {
  const { id } = useParams();

  /**
   * 주문 결과 조회 API 에러 캐칭 시나리오
   * 1. 401: 보호 라우트에서 미인증 사용자를 로그인 페이지로 이동시킨다.
   * 2. 404: 존재하지 않는 주문 번호임을 조회 실패 상태로 안내한다.
   * 3. 네트워크 및 서버 오류: 주문 결과 조회 실패 상태를 표시한다.
   */
  const { data, error, isLoading, isError } = useQuery(
    queryKeys.order(id),
    () => getOrderFromId(id)
  );
  useQueryAuthRecovery(error);

  const navigate = useNavigate();

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <QueryStatus
        isError
        title="주문 결과를 불러오지 못했습니다."
        message="주문 번호를 확인한 뒤 다시 시도해주세요."
      />
    );
  }

  const orderId = data.id;
  const orderProducts = data.products;
  const orderTotalPrice = data.totalPrice;

  return (
    <div className="px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-[800px]">
      <div className="mb-7 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-300 text-2xl" aria-hidden="true">✓</div>
        <Title className="mb-2">주문이 완료되었습니다</Title>
        <p className="text-sm text-gray-500">주문번호 {orderId}</p>
      </div>
      <Box className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md sm:p-6">
      <h2 className="mb-4 font-bold">주문상품 정보</h2>
      <div className="space-y-3">
        {data &&
          orderProducts.map((item) => {
            return (
              <section key={item.productName} className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
                <h3 className="font-bold">{item.productName}</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {item.items.map((option) => {
                    return (
                      <div key={option.id} className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
                        <div className="font-medium">{option.optionName}</div>
                        <div className="mt-2 text-gray-500">수량 {option.quantity}개</div>
                        <div className="mt-1 font-bold">{comma(option.price)}원</div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
      </div>
      <div className="mt-5 flex items-center justify-between border-t pt-5">
        <span className="text-base font-bold">총 주문 금액</span>
        <strong className="text-2xl">{comma(orderTotalPrice)}원</strong>
        </div>
        </Box>
        <Button
          className="mt-4 h-14 w-full rounded-xl bg-yellow-300 p-2 text-center font-bold hover:bg-yellow-400"
          onClick={() => {
          navigate(staticServerUri + "/");
        }}
      >
        <span>쇼핑 계속하기</span>
      </Button>
      </div>
    </div>
    
  );
};

export default OrderSuccessTemplate;

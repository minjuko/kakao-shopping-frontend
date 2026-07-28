import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import OptionList from "../atoms/OptionList";
import Button from "../atoms/Button";
import Container from "../atoms/Container";
import Counter from "../atoms/Counter";
import { addCart } from "../../services/cart";
import { queryKeys } from "../../services/queryKeys";
import useApiErrorHandler from "../../hooks/useApiErrorHandler";
import DeleteButton from "../atoms/DeleteButton";
import { comma } from "../../utils/convert";

const staticServerUri = process.env.REACT_APP_PATH || "";

const OptionColumn = ({ product }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [highlightedOptionId, setHighlightedOptionId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const highlightTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const handleApiError = useApiErrorHandler();

  useEffect(() => {
    return () => window.clearTimeout(highlightTimeoutRef.current);
  }, []);

  const handleOnClickOption = (option) => {
    window.clearTimeout(highlightTimeoutRef.current);
    setHighlightedOptionId(option.id);
    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedOptionId(null);
    }, 500);

    const isOptionSelected = selectedOptions.some(
      (selectedOption) => selectedOption.optionId === option.id
    );

    if (isOptionSelected) {
      return;
    }

    setSelectedOptions((prev) => [
      ...prev,
      {
        optionId: option.id,
        quantity: 1,
        price: option.price,
        name: option.optionName,
      },
    ]);
  };

  const handleOnChange = (count, optionId) => {
    setSelectedOptions((prev) => prev.map((option) => (
      option.optionId === optionId
        ? { ...option, quantity: count }
        : option
    )));
  };

  const handleOnDelete = (optionId) => {
    setSelectedOptions((prev) => prev.filter((option) => option.optionId !== optionId));
  };

  /**
   * 장바구니 추가 및 바로 구매 API 에러 캐칭 시나리오
   * 1. 401: 인증 정보를 제거하고 로그인 페이지로 이동한다.
   * 2. 404: 상품 또는 옵션을 찾을 수 없는 경우 404 페이지로 이동한다.
   * 3. 네트워크 오류: 사용자에게 네트워크 연결 확인을 안내한다.
   * 4. 그 외 서버 오류: 중복 옵션 가능성을 포함한 장바구니 추가 실패 메시지를 안내한다.
   * 5. 바로 구매: 선택 옵션을 장바구니에 저장한 뒤 주문 페이지로 이동한다.
   *
   * 상태 코드별 공통 동작은 useApiErrorHandler에서 처리한다.
   */
  const { mutate, isLoading } = useMutation({
    mutationFn: addCart,
    onError: (error) => handleApiError(
      error,
      "상품을 처리하지 못했습니다. 같은 옵션이 있다면 장바구니에서 수량을 조정해주세요.",
      setFeedbackMessage
    ),
    onSettled: () => setPendingAction(""),
  });

  const handleAddSelectedOptions = (destination, action) => {
    const payload = selectedOptions.map(({ optionId, quantity }) => ({
      optionId,
      quantity,
    }));

    setFeedbackMessage("");
    setPendingAction(action);
    mutate(payload, {
      onSuccess: async () => {
        await queryClient.invalidateQueries(queryKeys.cart);
        navigate(staticServerUri + destination);
      },
    });
  };

  const totalQuantity = selectedOptions.reduce(
    (total, option) => total + option.quantity,
    0
  );
  const totalPrice = selectedOptions.reduce(
    (total, option) => total + option.quantity * option.price,
    0
  );

  return (
    <section className="flex w-full flex-col rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-20 lg:self-start">
      <h2 className="mb-3 text-lg font-bold">옵션 선택</h2>
      <OptionList
        options={product.options}
        onClick={handleOnClickOption}
        highlightedOptionId={highlightedOptionId}
        selectedOptionIds={selectedOptions.map((option) => option.optionId)}
      />

      <Container className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
        <div className="mb-1 flex text-gray-800">
          <span className="mr-1 font-bold">배송 방법</span><span>택배배송</span>
        </div>
        <span className="font-bold">배송비</span>
        <span className="ml-2 rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-700">무료배송</span>
        <p className="mt-1 text-xs">제주 추가 3,000원, 제주 외 도서지역 추가 6,000원</p>
      </Container>

      <Container className="mb-1 mt-3 w-full">
        <ol className="selected-option-list">
          {selectedOptions.map((option) => (
            <li key={option.optionId} className="mb-2 w-full rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="name">{option.name}</div>
                <div className="flex items-center gap-3">
                  <div className="price whitespace-nowrap">
                    {comma(option.price * option.quantity)}원
                  </div>
                  <DeleteButton
                    label={option.name}
                    onClick={() => handleOnDelete(option.optionId)}
                  />
                </div>
              </div>
              <Counter
                onIncrease={(count) => handleOnChange(count, option.optionId)}
                onDecrease={(count) => handleOnChange(count, option.optionId)}
              />
            </li>
          ))}
        </ol>
      </Container>

      <Container className="w-full">
        <div className="my-3 flex flex-wrap items-end justify-between gap-2 border-t pt-4">
          <div className="text-sm text-gray-600">총 수량: {totalQuantity}개</div>
          <div><span className="mr-2 text-sm text-gray-600">총 상품금액</span><strong className="text-xl">{comma(totalPrice)}원</strong></div>
        </div>
      </Container>

      <Container className="mt-2 flex w-full gap-2">
        <Button
          className="h-12 flex-1 rounded-xl bg-gray-900 p-2 font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-300"
          disabled={selectedOptions.length === 0 || isLoading}
          onClick={() => handleAddSelectedOptions("/cart", "cart")}
        >
          {isLoading && pendingAction === "cart" ? "담는 중..." : "장바구니 담기"}
        </Button>
        <Button
          className="h-12 flex-1 rounded-xl bg-yellow-300 p-2 font-bold hover:bg-yellow-400 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
          disabled={selectedOptions.length === 0 || isLoading}
          onClick={() => handleAddSelectedOptions("/order", "purchase")}
        >
          {isLoading && pendingAction === "purchase" ? "구매 준비 중..." : "구매하기"}
        </Button>
      </Container>

      {feedbackMessage && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {feedbackMessage}
        </p>
      )}
    </section>
  );
};

export default OptionColumn;

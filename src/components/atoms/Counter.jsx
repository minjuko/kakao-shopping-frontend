import { useEffect, useState } from "react";

const Counter = ({
  initCount = 1,
  min = 1,
  max = 99,
  onIncrease = () => {},
  onDecrease = () => {},
}) => {
  const [count, setCount] = useState(initCount);

  useEffect(() => {
    setCount(initCount);
  }, [initCount]);

  const handleOnIncrease = () => {
    if (count < max) {
      const nextCount = count + 1;
      setCount(nextCount);
      onIncrease(nextCount);
    }
  };

  const handleOnDecrease = () => {
    if (count > min) {
      const nextCount = count - 1;
      setCount(nextCount);
      onDecrease(nextCount);
    }
  };

  return (
    <div className="flex" role="group" aria-label="상품 수량 선택">
        <button
          type="button"
          className="border w-6 disabled:text-gray-300"
          aria-label="수량 줄이기"
          disabled={count <= min}
          onClick={handleOnDecrease}
        >
          -
        </button>
        <output
          className="border w-12 text-center"
          aria-label="현재 수량"
          aria-live="polite"
        >
          {count}
        </output>
        <button
          type="button"
          className="border w-6 disabled:text-gray-300"
          aria-label="수량 늘리기"
          disabled={count >= max}
          onClick={handleOnIncrease}
        >
          +
        </button>
    </div>
  );
};

export default Counter;

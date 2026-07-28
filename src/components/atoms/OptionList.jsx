import { comma } from "../../utils/convert";

const OptionList = ({ options, onClick, highlightedOptionId, selectedOptionIds = [] }) => {
  return (
    <ol className="mb-2 w-full overflow-hidden rounded border border-gray-300">
      {options.map((option, index) => {
        const isSelected = selectedOptionIds.includes(option.id);
        const isHighlighted = highlightedOptionId === option.id;

        return (
          <li key={option.id} className="border-b last:border-b-0">
            <button
              type="button"
              aria-pressed={isSelected}
              className={`w-full p-3 text-left transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-400 ${
                isHighlighted
                  ? "bg-yellow-200"
                  : isSelected
                    ? "bg-yellow-50"
                    : "bg-white hover:bg-gray-50"
              }`}
              onClick={() => onClick(option)}
            >
              <span className="block">
                {index + 1}. {option.optionName}
              </span>
              <span className="ml-5 block">{comma(option.price)}원</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
};

export default OptionList;

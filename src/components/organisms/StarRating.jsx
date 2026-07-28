const StarRating = ({ starCount }) => (
  <div
    className="flex gap-0.5 text-sm text-yellow-400"
    aria-label={`평점 ${starCount}점`}
  >
    {Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={index < starCount ? "text-yellow-400" : "text-gray-200"}
        aria-hidden="true"
      >
        ★
      </span>
    ))}
  </div>
);
  
export default StarRating;

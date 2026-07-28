import { comma } from "../../utils/convert";
import Photo from "../atoms/Photo";
import StarRating from "../organisms/StarRating";

const staticServerUri = process.env.REACT_APP_PATH || "";


const ProductInformationColumn = ({ product}) => {
    const { productName, price} = product;

return (
    <section className="overflow-hidden rounded-2xl border border-black/5 bg-white p-3 shadow-sm">
        <div className="aspect-[2/1] w-full overflow-hidden rounded-xl bg-gray-50">
            <Photo
              src={`${staticServerUri}/assets${product.image}`}
              alt={productName}
              pictureClassName="h-full"
              className="h-full w-full object-contain p-2"
            />
        </div>
        <div className="flex flex-col items-start gap-2 pb-1 pt-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-gray-900 px-2 py-1 text-xs font-bold text-yellow-300">
              톡딜
            </span>
            <span className="text-xs font-medium text-gray-500">
              {product.freeShipping ? "무료배송" : "배송비 별도"}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{product.productName}</h1>
          <div className="flex items-center gap-2">
            <StarRating starCount={product.starCount}/>
            <span className="text-xs text-gray-500">
              리뷰 {comma(product.reviewCount)}
            </span>
          </div>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-xl font-bold text-red-500">{product.discountRate}%</span>
            <strong className="text-xl sm:text-2xl">{comma(price)}원</strong>
            <span className="pb-0.5 text-sm text-gray-400 line-through">
              {comma(product.originalPrice)}원
            </span>
          </div>
          <div className="mt-2 w-full rounded-xl bg-yellow-50 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold">톡딜 구매 혜택</span>
              <span className="font-bold text-gray-900">
                최대 {comma(product.rewardPoint)}원 적립
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              카카오페이 결제 시 포인트 적립 혜택을 받을 수 있습니다.
            </p>
          </div>
        </div>
    </section>
);
};

export default ProductInformationColumn;

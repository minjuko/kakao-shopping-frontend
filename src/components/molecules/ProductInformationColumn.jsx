import { comma } from "../../utils/convert";
import Photo from "../atoms/Photo";
import StarRating from "../organisms/StarRating";

const staticServerUri = process.env.REACT_APP_PATH || "";


const ProductInformationColumn = ({ product}) => {
    const { productName, price} = product;

return (
    <section className="overflow-hidden rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-6">
        <div>
            <Photo src={`${staticServerUri}/assets${product.image}`} alt={productName} className="aspect-[4/3] w-full rounded-xl object-cover"/>
        </div>
        <div className="flex flex-col gap-3 px-1 pb-2 pt-6">
        <StarRating starCount={product.starCount}/>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{product.productName}</h1>
            <p className="text-sm text-gray-500">톡딜가</p>
            <strong className="text-2xl">{comma(price)}원</strong>
        </div>
    </section>
);
};

export default ProductInformationColumn;

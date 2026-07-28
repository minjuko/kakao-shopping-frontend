import { useParams } from "react-router-dom";
import { getProductById } from "../services/product";
import { useQuery } from "@tanstack/react-query";
import ProductInformationColumn from "../components/molecules/ProductInformationColumn";
import OptionColumn from "../components/molecules/OptionColumn";
import Loader from "../components/atoms/Loader";
import { queryKeys } from "../services/queryKeys";
import QueryStatus from "../components/atoms/QueryStatus";

const ProductDetailPage = () => {
    const { id } = useParams(); 

    /**
     * 상품 상세 조회 API 에러 캐칭 시나리오
     * 1. 404: 삭제되었거나 존재하지 않는 상품임을 안내한다.
     * 2. 네트워크 오류: 네트워크 연결 문제를 포함한 조회 실패 상태를 표시한다.
     * 3. 그 외 서버 오류: 상품 상세 대신 오류 상태를 표시한다.
     */
    const { data: product, isError, isLoading} = useQuery(
      queryKeys.product(id),
      () => getProductById(id)
    );

  if(isLoading) {
    return (
      <Loader />
    )
  }

  if(isError) {
    return (
      <QueryStatus
        isError
        title="상품 정보를 불러오지 못했습니다."
        message="상품이 삭제되었거나 네트워크 연결이 원활하지 않습니다."
      />
    );
  }

    return (
      <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)] lg:py-12">
        <ProductInformationColumn product={product} />
        <OptionColumn product={product} />
      </div>
    );
};

export default ProductDetailPage;

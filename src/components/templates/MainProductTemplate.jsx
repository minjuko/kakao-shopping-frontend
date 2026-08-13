import { useEffect } from "react";
import Container from "../atoms/Container";
import ProductGrid from "../organisms/ProductGrid";
import { fetchProducts } from "../../services/product";
import { useInfiniteQuery } from "@tanstack/react-query";
import CardSkeleton from "../atoms/CardSkeleton";
import { useInView } from "react-intersection-observer";
import { queryKeys } from "../../services/queryKeys";
import QueryStatus from "../atoms/QueryStatus";
import { useSearchParams } from "react-router-dom";

const MainProductTemplate = () => {
    const { ref, inView } = useInView({
      rootMargin: "240px 0px",
    });
    const [searchParams] = useSearchParams();
    const keyword = (searchParams.get("q") ?? "").trim().toLowerCase();
    const selectedCategory = searchParams.get("category") ?? "전체";
    const hasFilter = Boolean(keyword) || selectedCategory !== "전체";

    /**
     * 상품 목록 조회 API 에러 캐칭 시나리오
     * 1. 네트워크 오류: 상품 조회 실패 화면과 재시도 안내를 표시한다.
     * 2. 그 외 서버 오류: 상품 목록 대신 오류 상태를 표시한다.
     * 3. 정상 응답이 빈 배열인 경우: 등록된 상품이 없다는 빈 상태를 표시한다.
     */
    const {
        data: products, 
        isLoading, 
        isError,
        isFetchingNextPage, 
        fetchNextPage, 
        hasNextPage
    } = useInfiniteQuery(queryKeys.products, ({pageParam = 0}) => fetchProducts(pageParam), {
        getNextPageParam: (lastPage, pages) => {
            if (lastPage.length < 6) {
                return undefined;
            }
            return pages.length;
        },
        enabled:true,
    }); 

    const productList = products?.pages.flat() ?? [];
    const filteredProductList = productList.filter((product) => {
      const matchesKeyword =
        !keyword || product.productName.toLowerCase().includes(keyword);
      const matchesCategory =
        selectedCategory === "전체" || product.category === selectedCategory;
      return matchesKeyword && matchesCategory;
    });
    const hasLoadedProducts = productList.length > 0;

    useEffect(() => {
      if (
        hasFilter &&
        hasNextPage &&
        !isFetchingNextPage &&
        !isError
      ) {
        fetchNextPage();
      }
    }, [
      fetchNextPage,
      hasFilter,
      hasNextPage,
      isError,
      isFetchingNextPage,
      productList.length,
    ]);

    useEffect(() => {
      if (
        inView &&
        !hasFilter &&
        !isLoading &&
        !isFetchingNextPage &&
        !isError &&
        hasNextPage
      ) {
        fetchNextPage();
      }
    }, [
      fetchNextPage,
      hasFilter,
      hasNextPage,
      inView,
      isError,
      isFetchingNextPage,
      isLoading,
    ]);
  
    if (isError && !hasLoadedProducts) {
      return (
        <QueryStatus
          isError
          title="상품을 불러오지 못했습니다."
          message="잠시 후 다시 시도해주세요."
        />
      );
    }

    const handleLoadMore = () => {
      if (!isFetchingNextPage && hasNextPage) {
        fetchNextPage();
      }
    };

    return(
        <Container>
            {isLoading ? <CardSkeleton /> : filteredProductList.length > 0 ? (
              <>
                <div className="mx-auto max-w-[1200px] px-4 pt-6 sm:px-6">
                  <p className="text-sm font-semibold text-yellow-600">오늘의 발견</p>
                  <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                      지금 인기 있는 상품
                    </h1>
                    <span className="text-sm text-gray-500">
                      {filteredProductList.length}개 상품
                    </span>
                  </div>
                </div>
                <ProductGrid products={filteredProductList}/>
              </>
            ) : hasFilter && hasNextPage ? (
              <div className="mx-auto max-w-[1200px] px-4 py-16 text-center text-sm text-gray-500 sm:px-6">
                검색 가능한 상품을 확인하고 있습니다.
              </div>
            ) : (
              <QueryStatus
                title={hasFilter ? "검색 결과가 없습니다." : "등록된 상품이 없습니다."}
                message={hasFilter ? "다른 검색어나 카테고리를 선택해보세요." : undefined}
              />
            )}
            <div ref={ref} className="h-1" aria-hidden="true"></div>
            {isFetchingNextPage && (
              <div aria-live="polite" aria-busy="true">
                <CardSkeleton />
                <span className="sr-only">다음 상품을 불러오는 중입니다.</span>
              </div>
            )}
            {isError && hasLoadedProducts && (
              <div
                className="mx-auto mb-8 max-w-md rounded-2xl border border-red-100 bg-red-50 p-5 text-center"
                role="alert"
              >
                <p className="text-sm text-red-700">
                  다음 상품을 불러오지 못했습니다.
                </p>
                <button
                  type="button"
                  className="mt-3 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
                  onClick={handleLoadMore}
                >
                  다시 시도
                </button>
              </div>
            )}
            {!isLoading && !isError && hasNextPage && (
              <div className="pb-8 text-center">
                <button
                  type="button"
                  className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold shadow-sm hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? "상품 불러오는 중..." : "상품 더 보기"}
                </button>
                <p className="mt-2 text-xs text-gray-400">
                  아래로 스크롤하면 상품을 자동으로 불러옵니다.
                </p>
              </div>
            )}
            {!isLoading && hasLoadedProducts && !hasNextPage && (
              <p className="pb-4 text-center text-sm text-gray-500">
                모든 상품을 확인했습니다.
              </p>
            )}
        </Container>
    );
};

export default MainProductTemplate;

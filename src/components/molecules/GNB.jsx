import React from "react";
import img from '../../assets/logoKakao.png';
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { setUser } from "../../store/slices/userSlice";
import { clearAuthToken, getAuthToken } from "../../utils/localStorage";
import { getCart } from "../../services/cart";
import { queryKeys } from "../../services/queryKeys";

const staticServerUri = process.env.REACT_APP_PATH || "";
const categories = ["전체", "식품", "생활", "디지털", "뷰티"];

const GNB = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const selectedCategory = searchParams.get("category") ?? "전체";

  const { data: cartData } = useQuery(queryKeys.cart, getCart, {
    enabled: Boolean(user),
    retry: false,
  });

  const cartCount = cartData?.products?.reduce(
    (productTotal, product) =>
      productTotal +
      product.carts.reduce(
        (optionTotal, option) => optionTotal + option.quantity,
        0
      ),
    0
  ) ?? 0;

  useEffect(() => {
    dispatch(setUser({ user: getAuthToken() }));
  }, [dispatch]);

  useEffect(() => {
    setKeyword(searchParams.get("q") ?? "");
  }, [searchParams]);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);
    const trimmedKeyword = keyword.trim();

    if (trimmedKeyword) {
      params.set("q", trimmedKeyword);
    } else {
      params.delete("q");
    }

    const query = params.toString();
    navigate(`${staticServerUri}/${query ? `?${query}` : ""}`);
  };

  const getCategoryPath = (category) => {
    const params = new URLSearchParams(searchParams);
    if (category === "전체") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    const query = params.toString();
    return `${staticServerUri}/${query ? `?${query}` : ""}`;
  };

  const handleLogOut = () => {
    dispatch(setUser({ user: null }));
    clearAuthToken();
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-[72px] max-w-[1200px] flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap sm:px-6">
        <Link to={staticServerUri + "/"} aria-label="카카오 쇼핑하기 홈">
          <img src={img} alt="카카오 쇼핑하기" className="h-9 w-auto sm:h-10" />
        </Link>
        <form
          className="order-3 flex w-full sm:order-none sm:ml-5 sm:max-w-md"
          role="search"
          onSubmit={handleSearch}
        >
          <label htmlFor="product-search" className="sr-only">상품 검색</label>
          <div className="flex h-11 w-full items-center rounded-xl bg-gray-100 px-4 focus-within:ring-2 focus-within:ring-yellow-300">
            <input
              id="product-search"
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="어떤 상품을 찾으시나요?"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="ml-2 rounded-full p-1 text-gray-600 hover:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label="검색"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4" />
              </svg>
            </button>
          </div>
        </form>
        <nav
          className="ml-auto flex items-center justify-end gap-2 text-sm sm:gap-3"
          aria-label="주요 메뉴"
        >
          <Link
            to={staticServerUri + "/cart"}
            className={`relative rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
              location.pathname === `${staticServerUri}/cart` ? "bg-gray-100 text-gray-900" : "text-gray-600"
            }`}
            aria-label="장바구니"
            aria-current={location.pathname === `${staticServerUri}/cart` ? "page" : undefined}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-7 w-7 fill-none stroke-current"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 4h2l1.8 10.2a2 2 0 0 0 2 1.7h7.9a2 2 0 0 0 1.9-1.4L21 7H6" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <Link
              to={staticServerUri + "/"}
              state={{ toastMessage: "로그아웃되었습니다." }}
              replace
              className="rounded-full px-3 py-2 font-medium hover:bg-gray-100"
              onClick={handleLogOut}
            >
              로그아웃
            </Link>
          ) : (
            <>
              <Link
                className={`rounded-full px-3 py-2 font-medium hover:bg-gray-100 ${
                  location.pathname === `${staticServerUri}/login` ? "bg-gray-100" : ""
                }`}
                to={staticServerUri + "/login"}
                aria-current={location.pathname === `${staticServerUri}/login` ? "page" : undefined}
              >
                로그인
              </Link>
              <Link
                to={staticServerUri + "/signup"}
                className={`rounded-full px-3 py-2 font-semibold ${
                  location.pathname === `${staticServerUri}/signup`
                    ? "bg-yellow-400"
                    : "bg-yellow-300 hover:bg-yellow-400"
                }`}
                aria-current={location.pathname === `${staticServerUri}/signup` ? "page" : undefined}
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
      <nav
        className="border-t border-gray-100 bg-white"
        aria-label="상품 카테고리"
      >
        <div className="mx-auto flex max-w-[1200px] gap-1 overflow-x-auto px-4 sm:px-6">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <Link
                key={category}
                to={getCategoryPath(category)}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {category === "전체" ? "홈" : category}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
};

export default GNB;

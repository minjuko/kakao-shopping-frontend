import React from "react";
import img from '../../assets/logoKakao.png';
import cart from "../../assets/cart.png";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { setUser } from "../../store/slices/userSlice";
import { clearAuthToken, getAuthToken } from "../../utils/localStorage";

const staticServerUri = process.env.REACT_APP_PATH || "";

const GNB = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    dispatch(setUser({ user: getAuthToken() }));
  }, [dispatch]);


  const handleLogOut = () => {
    dispatch(setUser({ user: null }));
    clearAuthToken();
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-[72px] max-w-[1200px] items-center gap-3 px-4 sm:px-6">
        <Link to={staticServerUri + "/"} aria-label="카카오 쇼핑하기 홈">
          <img src={img} alt="카카오 쇼핑하기" className="h-9 w-auto sm:h-10" />
        </Link>
        <nav
          className="ml-auto flex items-center justify-end gap-2 text-sm sm:gap-3"
          aria-label="주요 메뉴"
        >
          <Link
            to={staticServerUri + "/cart"}
            className="rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            aria-label="장바구니"
          >
            <img src={cart} alt="" className="h-8 w-8" />
          </Link>
          {user ? (
            <Link
              to={staticServerUri + "/"}
              className="rounded-full px-3 py-2 font-medium hover:bg-gray-100"
              onClick={handleLogOut}
            >
              로그아웃
            </Link>
          ) : (
            <>
              <Link className="rounded-full px-3 py-2 font-medium hover:bg-gray-100" to={staticServerUri + "/login"}>
                로그인
              </Link>
              <Link
                to={staticServerUri + "/signup"}
                className="rounded-full bg-yellow-300 px-3 py-2 font-semibold hover:bg-yellow-400"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default GNB;

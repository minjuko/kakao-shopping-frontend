import React, { useState } from 'react';
import InputGroup from "../molecules/InputGroup";
import useInput from "../../hooks/useInput";
import { login } from '../../services/user';
import { useDispatch } from "react-redux";
import { setUser } from "../../store/slices/userSlice";
import { setAuthToken } from "../../utils/localStorage";
import { Link, useNavigate } from 'react-router-dom';
import Title from "../atoms/Title";
import logoKakao from "../../assets/logoKakao.png";
import {
    isValidAuthForm,
    validateAuthField,
    validateLogin,
} from "../../utils/authValidation";

const staticServerUri = process.env.REACT_APP_PATH || "";

const LoginForm = () => {
    const dispatch = useDispatch();
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { value, handleOnChange } = useInput({
        email: "",
        password: "",
    });

    const [invalidCheck, setInvalidCheck] = useState({
        email: "",
        password: "",
    });

    const handleOnCheck = (e) => {
        const { name, value: inputValue } = e.target;
        setInvalidCheck((prev) => ({
            ...prev,
            [name]: validateAuthField(name, inputValue, {
                ...value,
                [name]: inputValue,
            }),
        }));
    };

    /**
     * 로그인 API 에러 캐칭 시나리오
     * 1. 401: 이메일 또는 비밀번호가 일치하지 않는다는 서버 메시지를 표시한다.
     * 2. 네트워크 오류: 로그인 실패 기본 메시지를 화면에 표시한다.
     * 3. 그 외 서버 오류: 서버 메시지가 있으면 우선 표시하고 재제출할 수 있게 한다.
     */
    const loginReq = async (event) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        const validation = validateLogin(value);
        setInvalidCheck(validation);

        if (!isValidAuthForm(validation)) {
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const res = await login({
                email: value.email,
                password: value.password,
            });
            const token = res.headers.authorization;
            dispatch(setUser({ user: token }));
            setAuthToken(token, 1000 * 60 * 60 * 24);
            navigate(staticServerUri + "/", {
                replace: true,
                state: { toastMessage: "로그인되었습니다." },
            });
        } catch (err) {
            setError(err.response?.data?.error?.message ?? "로그인에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const navigate = useNavigate();

    return (
        <main className="flex min-h-screen flex-col items-center bg-white px-4 pb-8 pt-12 sm:pt-14">
            <Link
                to={staticServerUri + "/"}
                className="mb-8"
                aria-label="카카오 쇼핑하기 홈"
            >
                <img src={logoKakao} alt="쇼핑하기" className="h-10 w-auto" />
            </Link>

            <section className="w-full max-w-[460px] rounded-2xl border border-gray-300 bg-white px-6 py-8 sm:px-11 sm:py-9">
                <div className="mb-8 text-center">
                    <Title className="mb-3 text-[22px]">카카오계정으로 로그인</Title>
                    <p className="text-sm leading-6 text-gray-500">
                        카카오 쇼핑하기를 이용하려면 로그인해 주세요.
                    </p>
                </div>

                <form onSubmit={loginReq} noValidate>
                    {process.env.REACT_APP_ENABLE_MOCKS === "true" && (
                        <div className="mb-6 rounded-lg bg-[#fffbea] px-4 py-3 text-[13px] leading-5 text-gray-600" role="note">
                            <p>프론트엔드 데모 모드에서는 아래 예시 계정으로 로그인할 수 있습니다.</p>
                            <dl className="mt-2 grid grid-cols-[64px_1fr] gap-x-2 font-medium text-gray-800">
                                <dt>아이디</dt>
                                <dd>test@test.com</dd>
                                <dt>비밀번호</dt>
                                <dd>test1234!</dd>
                            </dl>
                        </div>
                    )}
                    <InputGroup
                        id="email"
                        name="email"
                        type="email"
                        placeholder="이메일"
                        label="이메일 (아이디)"
                        value={value.email}
                        onChange={handleOnChange}
                        onBlur={handleOnCheck}
                        invalid={invalidCheck}
                        autoComplete="email"
                        required
                        inputClassName="h-14 rounded-lg border-gray-300 text-[15px] focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                    <InputGroup
                        id="password"
                        name="password"
                        type="password"
                        placeholder="비밀번호"
                        label="비밀번호"
                        value={value.password}
                        onChange={handleOnChange}
                        onBlur={handleOnCheck}
                        invalid={invalidCheck}
                        autoComplete="current-password"
                        required
                        inputClassName="h-14 rounded-lg border-gray-300 text-[15px] focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                    {error && <p className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">{error}</p>}
                    <button
                        className="h-14 w-full rounded-lg bg-[#fee500] text-[16px] font-semibold text-[#191919] transition hover:bg-[#f5dc00] focus:outline-none focus:ring-2 focus:ring-[#191919] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "로그인 중..." : "로그인"}
                    </button>

                    <div className="my-6 flex items-center gap-4" aria-hidden="true">
                        <span className="h-px flex-1 bg-gray-200" />
                        <span className="text-xs text-gray-400">또는</span>
                        <span className="h-px flex-1 bg-gray-200" />
                    </div>

                    <Link
                        to={staticServerUri + "/signup"}
                        className="flex h-14 w-full items-center justify-center rounded-lg border border-gray-300 bg-white text-[15px] font-semibold text-gray-800 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                    >
                        회원가입
                    </Link>
                </form>
            </section>

            <p className="mt-6 text-center text-xs text-gray-400">
                © Kakao Shopping Clone
            </p>
        </main>
    );
};

export default LoginForm;

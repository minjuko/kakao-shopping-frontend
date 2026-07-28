import React, { useState } from "react";
import InputGroup from "../molecules/InputGroup";
import useInput from "../../hooks/useInput";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/user";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/slices/userSlice";
import { setAuthToken } from "../../utils/localStorage";
import Title from "../atoms/Title";
import logoKakao from "../../assets/logoKakao.png";
import {
    isValidAuthForm,
    validateAuthField,
    validateRegistration,
} from "../../utils/authValidation";

const staticServerUri = process.env.REACT_APP_PATH || "";

const RegisterForm = () => {
    const dispatch = useDispatch();
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { value, handleOnChange } = useInput({
        username: "",
        email: "",
        password: "",
        passwordConfirm: "",
    });

    const [invalidCheck, setInvalidCheck] = useState({
        email: "",
        username: "",
        password: "",
        passwordConfirm: "",
    });

    const handleOnCheck = (e) => {
        const { name, value: inputValue } = e.target;
        const nextValues = { ...value, [name]: inputValue };

        setInvalidCheck((prev) => ({
            ...prev,
            [name]: validateAuthField(name, inputValue, nextValues),
            ...(name === "password" && value.passwordConfirm
                ? {
                    passwordConfirm: validateAuthField(
                        "passwordConfirm",
                        value.passwordConfirm,
                        nextValues
                    ),
                }
                : {}),
        }));
    };

    /**
     * 회원가입 API 에러 캐칭 시나리오
     * 1. 400·409: 유효하지 않은 정보나 중복 이메일에 대한 서버 메시지를 표시한다.
     * 2. 네트워크 오류: 회원가입 실패 기본 메시지를 화면에 표시한다.
     * 3. 그 외 서버 오류: 서버 메시지가 있으면 우선 표시하고 재제출할 수 있게 한다.
     */
    const registerReq = async (event) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        const validation = validateRegistration(value);
        setInvalidCheck(validation);

        if (!isValidAuthForm(validation)) {
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const res = await register({
                email: value.email,
                password: value.password,
                username: value.username,
            });
            const token = res.headers.authorization;
            dispatch(setUser({ user: token }));
            setAuthToken(token, 1000 * 60 * 60 * 24);
            navigate(staticServerUri + "/", {
                replace: true,
                state: { toastMessage: "회원가입이 완료되었습니다." },
            });
        } catch (err) {
            setError(err.response?.data?.error?.message ?? "회원가입에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };


    const navigate = useNavigate();
    return (
        <main className="flex min-h-screen flex-col items-center bg-white px-4 pb-8 pt-10 sm:pt-12">
            <Link
                to={staticServerUri + "/"}
                className="mb-7"
                aria-label="카카오 쇼핑하기 홈"
            >
                <img src={logoKakao} alt="쇼핑하기" className="h-10 w-auto" />
            </Link>

            <section className="w-full max-w-[460px] rounded-2xl border border-gray-300 bg-white px-6 py-8 sm:px-11 sm:py-9">
                <div className="mb-7 text-center">
                    <Title className="mb-3 text-[22px]">카카오 쇼핑 회원가입</Title>
                    <p className="text-sm leading-6 text-gray-500">
                        간단한 정보 입력으로 쇼핑을 시작해 보세요.
                    </p>
                </div>

                <form onSubmit={registerReq} noValidate>
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
                        id="username"
                        name="username"
                        type="text"
                        placeholder="이름"
                        label="이름"
                        value={value.username}
                        onChange={handleOnChange}
                        onBlur={handleOnCheck}
                        invalid={invalidCheck}
                        autoComplete="name"
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
                        autoComplete="new-password"
                        required
                        inputClassName="h-14 rounded-lg border-gray-300 text-[15px] focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                    <InputGroup
                        id="passwordConfirm"
                        name="passwordConfirm"
                        type="password"
                        placeholder="비밀번호 확인"
                        label="비밀번호 확인"
                        value={value.passwordConfirm}
                        onChange={handleOnChange}
                        onBlur={handleOnCheck}
                        invalid={invalidCheck}
                        autoComplete="new-password"
                        required
                        inputClassName="h-14 rounded-lg border-gray-300 text-[15px] focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                    {error && <p className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">{error}</p>}
                    <button
                        className="h-14 w-full rounded-lg bg-[#fee500] text-[16px] font-semibold text-[#191919] transition hover:bg-[#f5dc00] focus:outline-none focus:ring-2 focus:ring-[#191919] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "가입 중..." : "회원가입"}
                    </button>

                    <div className="my-6 flex items-center gap-4" aria-hidden="true">
                        <span className="h-px flex-1 bg-gray-200" />
                        <span className="text-xs text-gray-400">또는</span>
                        <span className="h-px flex-1 bg-gray-200" />
                    </div>

                    <Link
                        to={staticServerUri + "/login"}
                        className="flex h-14 w-full items-center justify-center rounded-lg border border-gray-300 bg-white text-[15px] font-semibold text-gray-800 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                    >
                        로그인
                    </Link>
                </form>
            </section>

            <p className="mt-6 text-center text-xs text-gray-400">
                © Kakao Shopping Clone
            </p>
        </main>
    );
};

export default RegisterForm;

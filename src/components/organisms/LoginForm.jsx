import React, { useState } from 'react';
import InputGroup from "../molecules/InputGroup";
import useInput from "../../hooks/useInput";
import LinkText from "../atoms/LinkText";
import { login } from '../../services/user';
import { useDispatch } from "react-redux";
import { setUser } from "../../store/slices/userSlice";
import { setAuthToken } from "../../utils/localStorage";
import { useNavigate } from 'react-router-dom';
import Title from "../atoms/Title";
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
            navigate(staticServerUri + "/");
        } catch (err) {
            setError(err.response?.data?.error?.message ?? "로그인에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const navigate = useNavigate();

    return (
        <>
            <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-10">
                <div className="mb-7 text-center">
                    <p className="mb-2 text-sm font-semibold text-yellow-600">KAKAO SHOPPING</p>
                    <Title className="mb-2">로그인</Title>
                    <p className="text-sm text-gray-500">쇼핑을 계속하려면 계정에 로그인하세요.</p>
                </div>
                <form className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-6 shadow-lg sm:p-8" onSubmit={loginReq} noValidate>
                    {process.env.REACT_APP_ENABLE_MOCKS === "true" && (
                        <p className="mb-4 bg-yellow-50 p-2 text-sm" role="note">
                            데모 모드에서는 형식에 맞는 이메일과 비밀번호로 로그인할 수 있습니다.
                        </p>
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
                    />
                    {error && <p className="mb-4 border border-red-100 bg-red-50 p-2 text-red-600" role="alert">{error}</p>}
                    <button className="h-12 w-full rounded-xl bg-yellow-300 font-bold hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "로그인 중..." : "로그인"}
                    </button>
					<div className="mt-5 text-center text-sm text-gray-600">
                        아직 계정이 없나요?{" "}
                        <LinkText to={staticServerUri + "/signup"} text="회원가입" />
                    </div>
                </form>
            </main>
        </>
    );
};

export default LoginForm;

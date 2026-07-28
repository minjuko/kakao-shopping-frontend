import React, { useState } from "react";
import InputGroup from "../molecules/InputGroup";
import useInput from "../../hooks/useInput";
import LinkText from "../atoms/LinkText";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/user";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/slices/userSlice";
import { setAuthToken } from "../../utils/localStorage";
import Title from "../atoms/Title";
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
            navigate(staticServerUri + "/");
        } catch (err) {
            setError(err.response?.data?.error?.message ?? "회원가입에 실패했습니다.");
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
                    <Title className="mb-2">회원가입</Title>
                    <p className="text-sm text-gray-500">간단한 정보 입력으로 데모 쇼핑을 시작하세요.</p>
                </div>
                <form className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-6 shadow-lg sm:p-8" onSubmit={registerReq} noValidate>
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
                    />
                    {error && <p className="mb-4 border border-red-100 bg-red-50 p-2 text-red-600" role="alert">{error}</p>}
                    <button className="h-12 w-full rounded-xl bg-yellow-300 font-bold hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "가입 중..." : "회원가입"}
                    </button>
                    <div className="mt-5 text-center text-sm text-gray-600">
                        이미 계정이 있나요?{" "}
						 <LinkText to={staticServerUri + "/login"} text="로그인" />
                    </div>
                </form>
            </main>
        </>
    );
};

export default RegisterForm;

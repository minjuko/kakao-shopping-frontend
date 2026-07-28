const ERROR_MSG = {
    required: "필수 입력 사항입니다.",
    invalidEmail: "이메일 형식이 유효하지 않습니다.",
    invalidPw: "8-20자 이내 영문 대소문자, 숫자, 특수문자를 입력하세요.",
    invalidConfirmPw: "비밀번호가 일치하지 않습니다.",
  };
  
  const ErrorMsg = ({ errorMsg = {}, name }) => {
    const message = ERROR_MSG[errorMsg[name]];

    if (!message) {
      return null;
    }

    return (
      <p id={`${name}-error`} className="mb-4 text-xs text-red-600" role="alert">
        {message}
      </p>
    );
  };
  
  export default ErrorMsg;

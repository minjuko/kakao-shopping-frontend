/**
 * 
 * @param {*} onClick 버튼 클릭 이벤트 핸들러 함수
 * @param {*} className 추가 css 클래스 이름
 * @returns Button Component
 */

const Button = ({ onClick, children, className = "", type = "button", ...buttonProps }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`button ${className}`}
            {...buttonProps}
        >
            {children}
        </button>
    );
};

export default Button;

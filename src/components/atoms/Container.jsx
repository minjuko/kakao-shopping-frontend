/**
 * @param {*} className 추가 css 클래스 이름
 * @Returns Container Component
 */

const Container = ({children, className = ""}) => {
    return( 
        <div className={`w-full ${className}`}>
            {children}
        </div>
    );
};

export default Container;

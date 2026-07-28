import { Link } from 'react-router-dom';
const LinkText = ({ text, to, className, onClick }) => {
    return (
        <span>
            <Link
                to={to}
                className={`font-semibold text-gray-900 underline decoration-yellow-400 decoration-2 underline-offset-4 ${className ?? ""}`}
                onClick={onClick}
            >
                {text}
            </Link>
        </span>
    );
};

export default LinkText;

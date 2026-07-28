import { Link } from "react-router-dom";

const Card = ({ to, children, className = "" }) => {
    return (
        <Link
            className={`group block w-full overflow-hidden rounded-2xl border border-black/5 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 ${className}`}
            to={to}
        >
            {children}
        </Link>
    );
};

export default Card;

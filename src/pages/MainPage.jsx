import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MyCarousel from "../components/atoms/MyCarousel";
import MainProductTemplate from "../components/templates/MainProductTemplate";
import Toast from "../components/Toast";

const MainPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [toastMessage, setToastMessage] = useState(
        location.state?.toastMessage ?? ""
    );

    useEffect(() => {
        if (!location.state?.toastMessage) {
            return;
        }

        setToastMessage(location.state.toastMessage);
        navigate(location.pathname + location.search, {
            replace: true,
            state: null,
        });
    }, [
        location.pathname,
        location.search,
        location.state?.toastMessage,
        navigate,
    ]);

    useEffect(() => {
        if (!toastMessage) {
            return undefined;
        }

        const timer = window.setTimeout(() => {
            setToastMessage("");
        }, 3000);

        return () => window.clearTimeout(timer);
    }, [toastMessage]);

    return (
        <>
            <MyCarousel />
            <MainProductTemplate />
            {toastMessage && (
                <Toast
                    message={toastMessage}
                    onClose={() => setToastMessage("")}
                />
            )}
        </>
    );
};

export default MainPage;

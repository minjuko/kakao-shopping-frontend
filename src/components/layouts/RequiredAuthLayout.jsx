import Footer from "../atoms/Footer";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import GNB from "../molecules/GNB";
import { isAuthenticated } from "../../utils/localStorage";

const staticServerUri = process.env.REACT_APP_PATH || ""

const RequiredAuthLayout = () => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to={staticServerUri + "/login"}
        replace
        state={{ from: location }}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <GNB />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default RequiredAuthLayout;

import React from "react";
import GNB from "../molecules/GNB";
import { Outlet } from "react-router-dom";
import Footer from "../atoms/Footer";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <GNB />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

import React from "react";
import HeaderClient from "./clientHeader";
import MenuClient from "./clientMenu";
import Footer from "./clientFooter";
import BottomBar from "./bottomBar";

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <HeaderClient />
      <div className="mx-[5%]">
        <MenuClient />
        {children}
        <BottomBar />
        <Footer />
      </div>
    </>
  );
};

export default ClientLayout;

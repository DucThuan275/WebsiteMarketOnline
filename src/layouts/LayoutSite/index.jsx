import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import ProductChatbot from "../../components/chatbot/chat-bot";

const index = () => {
  return (
    <>
        <Header />
        <div>
          <Outlet />
        </div>
        <ProductChatbot />
        <Footer />
    </>
  );
};

export default index;

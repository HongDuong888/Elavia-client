import React from "react";
import { useAuth } from "../context/auth.context";
import { useNavigate, Navigate } from "react-router-dom";

const CheckLogin = ({ element }: { element: JSX.Element }) => {
  const { auth } = useAuth();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return element;
};

export default CheckLogin;

import axios from "axios";
import httpStatus from "http-status";
import { Children, createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL}/api/v1/users`,
});

export const AuthProvider = ({ children }) => {
  const authContext = useContext(AuthContext);

  const [userData, setUserData] = useState(authContext);

  const router = useNavigate();

  const handleRegister = async (name, email, password, confirmPassword) => {
    try {
      let request = await client.post("/register", {
        name: name,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      });

      if (request.status === httpStatus.CREATED) {
        return request.data.message;
      }
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const handleLogin = async (email, password) => {
    try {
      let request = await client.post("/login", {
        email: email,
        password: password,
      });

      if (request.status === httpStatus.OK) {
        localStorage.setItem("token", request.data.token);
        router("/home");
        return request.data.message;
      }
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const getHistoryOfUser = async () => {
    try {
      let request = await client.get("/get-all-history", {
        params: {
          token: localStorage.getItem("token"),
        },
      });

      return request.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const addToUserHistory = async (meetingId) => {
    try {
      let request = await client.post("/add-to-history", {
        token: localStorage.getItem("token"),
        meetingId: meetingId,
      });

      return request.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const data = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
    getHistoryOfUser,
    addToUserHistory,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080",
});

export const register = (userData) => {
  return API.post("/auth/register", userData);
};

export const login = (loginData) => {
  return API.post("/auth/login", loginData);
};
export const dashboard = (token) =>
  API.get("/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
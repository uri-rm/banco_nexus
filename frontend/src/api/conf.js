import { API_BASE_URL } from "@/config";
import axios from "axios";

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const register = (data) =>
  API.post("/auth/register", data);

export const login = (data) =>
  API.post("/auth/token", {
    email: data.email,
    password: data.password,
  });

export const getMe = () =>
  API.get("/users/me");

export const updateMe = (data) =>
  API.put("/users/me", data);

export const getTransactions = () =>
  API.get("/transactions/");

export const createOwnTransaction = (data) =>
  API.post("/transactions/", data);

export const createTransaction = (destinyAccount, data) =>
  API.post(`/transactions/${destinyAccount}`, data);

export const getDestinyAccounts = () =>
  API.get("/users/destiny_accounts");

export const addDestinyAccount = (destinyAccount, data) =>
  API.post(`/users/add_account/${destinyAccount}`, data);

export default API;

import axios from "axios";

const BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sb_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ───────────────────────────────────────────────────────────────────
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const logoutUser = () => api.post("/auth/logout");

// ─── User (account info) ────────────────────────────────────────────────────
export const getMyUser = () => api.get("/users/profile");
export const updateUserInfo = (data) => api.put("/users/info", data);
export const updatePassword = (data) => api.put("/users/password", data);

// ─── Profile (freelancer profile) ───────────────────────────────────────────
export const getMyProfile = () => api.get("/profiles/me");
export const updateProfile = (data) => api.put("/profiles/", data);
export const addSkill = (skill) => api.post("/profiles/skills", { skill });
export const removeSkill = (skill) => api.delete("/profiles/skills", { data: { skill } });
export const addPortfolio = (url) => api.post("/profiles/portfolio", { url });
export const removePortfolio = (url) => api.delete("/profiles/portfolio", { data: { url } });
export const getPublicProfile = (userId) => api.get(`/profiles/${userId}`);

export default api;

import api from "./ApiInterSepter";

const BackendAuth = import.meta.env.VITE_BACKEND_URL;

export const authApi = {
  register: async (userData) => {
    try {
      const response = await api.post(`/user/register`, userData);
      return response.data;
    } catch (error) {
      console.log(error);
      return error.response?.data || { status: false, message: "Registration failed" };
    }
  },
  login: async (userData) => {
    try {
      const response = await api.post(`/user/login`, userData);
      return response.data;
    } catch (error) {
      console.log(error);
      return error.response?.data || { status: false, message: "Login failed" };
    }
  },
  verifyOtp: async (data) => {
    try {
      const response = await api.post(`/user/verify-login-otp`, data);
      return response.data;
    } catch (error) {
      console.log(error);
      return error.response?.data || { status: false, message: "OTP verification failed" };
    }
  },
  resendOtp: async (data) => {
    try {
      const response = await api.post(`/user/resend-otp`, data);
      return response.data;
    } catch (error) {
      console.log(error);
      return error.response?.data || { status: false, message: "Failed to resend OTP" };
    }
  },
  getCurrentUser: async () => {
    try {
      const response = await api.get(`/user/my-profile`);
      return response.data;
    } catch (error) {
      console.log(error);
      return error.response?.data || { status: false, message: "Failed to fetch user" };
    }
  },
  refreshToken: async () => {
    try {
      const response = await api.post(`/user/refresh`, {});
      return response.data;
    } catch (error) {
      console.log(error);
      return { status: false, message: "Refresh failed" };
    }
  },
  logout: async () => {
    try {
      const response = await api.post(`/user/logout`, {});
      return response.data;
    } catch (error) {
      console.log(error);
      return { status: false, message: "Refresh failed" };
    }
  }
};



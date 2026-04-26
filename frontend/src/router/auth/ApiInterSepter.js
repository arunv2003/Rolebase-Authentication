import axios from "axios";

const BackendAuth = import.meta.env.VITE_BACKEND_URL;

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

const api = axios.create({
  baseURL: BackendAuth,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (config.method === "post" || config.method === "put" || config.method === "delete") {
      const csrfToken = getCookie("csrfToken");
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let isCSRFRefreshing = false;

let failedQueue = [];
let failedCSRFQueue = [];


const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const processCSRFQueue = (error, token = null) => {
  failedCSRFQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedCSRFQueue = [];
};

api.interceptors.response.use(
  async (response) => {
    const originalRequest = response.config;

    // Check if the response body indicates a token expiration despite a successful HTTP status
    const errorCode = response.data?.code;

    if (errorCode?.startsWith("CSRF_") && !originalRequest._retry) {
      if (isCSRFRefreshing) {
        return new Promise((resolve, reject) => {
          failedCSRFQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isCSRFRefreshing = true;
      try {
        const refreshResponse = await axios.post(`${BackendAuth}/user/refresh-csrf`, {}, { withCredentials: true });
        if (refreshResponse.data.status) {
          processCSRFQueue(null);
          return api(originalRequest);
        } else {
          processCSRFQueue(new Error("Refresh failed"));
          return response;
        }
      } catch (refreshError) {
        processCSRFQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isCSRFRefreshing = false;
      }
    }

    if (response.data?.message === "Token Expired" && !originalRequest._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(`${BackendAuth}/user/refresh`, {}, { withCredentials: true });
        
        if (refreshResponse.data.status) {
          processQueue(null);
          return api(originalRequest);
        } else {
          processQueue(new Error("Refresh failed"));
          return response; // Return the original 'expired' response if refresh fails
        }
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle CSRF Refresh in error case (e.g., 401 Unauthorized)
    const errorCode = error.response?.data?.code;
    if (errorCode?.startsWith("CSRF_") && !originalRequest._retry) {
      if (isCSRFRefreshing) {
        return new Promise((resolve, reject) => {
          failedCSRFQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isCSRFRefreshing = true;

      try {
        const refreshResponse = await axios.post(`${BackendAuth}/user/refresh-csrf`, {}, { withCredentials: true });
        if (refreshResponse.data.status) {
          processCSRFQueue(null);
          return api(originalRequest);
        } else {
          processCSRFQueue(new Error("Refresh failed"));
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processCSRFQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isCSRFRefreshing = false;
      }
    }

    // Also handle actual 401/403 error statuses
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(`${BackendAuth}/user/refresh`, {}, { withCredentials: true });
        
        if (refreshResponse.data.status) {
          processQueue(null);
          return api(originalRequest);
        } else {
          processQueue(new Error("Refresh failed"));
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

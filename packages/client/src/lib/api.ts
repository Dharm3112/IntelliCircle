import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api",
    withCredentials: true, // Crucial for sending/receiving HTTP-Only cookies (refresh token)
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401s remotely
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Not yet implemented on backend, but this is standard pattern
                // const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
                // useAuthStore.getState().setAuth(data.data.accessToken, data.data.user);
                // originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
                // return api(originalRequest);

                // For now, force logout if unauthorized
                useAuthStore.getState().logout();
                return Promise.reject(error);
            } catch (err) {
                useAuthStore.getState().logout();
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

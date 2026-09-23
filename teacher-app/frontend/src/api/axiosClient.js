import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:5000/api', 
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.response.use(
    (response) => {
        if (response && response.data) {
        return response.data;
        }
        return response;
    },
    (error) => {
        const message = error.response?.data?.message || 'Có lỗi xảy ra!';
        return Promise.reject(new Error(message));
    }
);

export default axiosClient;
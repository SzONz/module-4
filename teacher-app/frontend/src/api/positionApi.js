import axios from 'axios';

const API_URL = "http://localhost:5000/api/teacher-positions";

export const positionApi = {
    getAll: async () => {
        const response = await axios.get(API_URL);
        return response.data;
    },

    create: async (data) => {
        const response = await axios.post(API_URL, data);
        return response.data;
    },
};
import axiosClient from './axiosClient';

export const teacherApi = {
    getAll: (page = 1, limit = 10) => {
        return axiosClient.get(`/teachers?page=${page}&limit=${limit}`);
    },

    getById: (id) => {
        return axiosClient.get(`/teachers/${id}`);
    },

    create: (data) => {
        return axiosClient.post('/teachers', data);
    },

    update: (id, data) => {
        return axiosClient.put(`/teachers/${id}`, data);
    },

    delete: (id) => {
        return axiosClient.delete(`/teachers/${id}`);
    },
};
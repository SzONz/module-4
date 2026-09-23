import React, { useState, useEffect } from 'react';
import { positionApi } from '../api/positionApi';

const PositionPage = () => {
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [formData, setFormData] = useState({ code: '', name: '', des: '', isActive: true });

    const loadPositions = async () => {
        setLoading(true);
        try {
        const res = await positionApi.getAll();
        const data = res.data || res;
        setPositions(Array.isArray(data) ? data : []);
        } catch (err) {
        console.error(err.message);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        loadPositions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        await positionApi.create(formData);
        alert('Tạo vị trí thành công!');
        setIsDrawerOpen(false);
        setFormData({ code: '', name: '', des: '', isActive: true });
        loadPositions();
        } catch (err) {
        alert(err.message);
        }
    };

    const getId = (item) => {
        if (typeof item._id === 'object' && item._id?.$oid) {
        return item._id.$oid;
        }
        return item._id;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
            <div>
            <h1 className="text-2xl font-bold text-gray-800">Vị trí Công tác</h1>
            <p className="text-sm text-gray-500">Quản lý các chức danh và vị trí làm việc</p>
            </div>
            <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm text-sm font-medium"
            >
            Tạo mới
            </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                <th className="p-4 w-16">STT</th>
                <th className="p-4">Mã vị trí</th>
                <th className="p-4">Tên vị trí</th>
                <th className="p-4">Mô tả</th>
                <th className="p-4">Trạng thái</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {loading ? (
                <tr><td colSpan="5" className="text-center p-8">Đang tải dữ liệu...</td></tr>
                ) : positions.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-8 text-gray-400">Chưa có dữ liệu vị trí công tác</td></tr>
                ) : (
                positions.map((item, idx) => (
                    <tr key={getId(item)} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-400">{idx + 1}</td>
                    <td className="p-4 font-mono font-bold text-indigo-600">{item.code}</td>
                    <td className="p-4 font-semibold text-gray-800">{item.name}</td>
                    <td className="p-4 text-gray-500">{item.des || '—'}</td>
                    <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.isActive ? 'Hoạt động' : 'Ngừng'}
                        </span>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>

        {isDrawerOpen && (
            <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
            <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between">
                <div>
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Thêm vị trí mới</h2>
                    <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 text-lg font-bold">✕</button>
                </div>

                <form id="posForm" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Mã vị trí *</label>
                    <input
                        required
                        className="w-full border rounded-lg p-2.5 text-sm uppercase focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="VD: TTS"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                    </div>
                    <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tên vị trí *</label>
                    <input
                        required
                        className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="VD: Thực tập sinh"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    </div>
                    <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Mô tả *</label>
                    <textarea
                        required
                        rows="3"
                        className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Mô tả công việc..."
                        value={formData.des}
                        onChange={(e) => setFormData({ ...formData, des: e.target.value })}
                    />
                    </div>
                </form>
                </div>

                <div className="border-t pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsDrawerOpen(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600">
                    Hủy
                </button>
                <button form="posForm" type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                    Lưu
                </button>
                </div>
            </div>
            </div>
        )}
        </div>
    );
};

export default PositionPage;
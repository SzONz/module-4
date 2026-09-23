import React, { useState, useEffect } from 'react';
import { teacherApi } from '../api/teacherApi';
import { positionApi } from '../api/positionApi';

const TeacherPage = () => {
    const [teachers, setTeachers] = useState([]);
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        identity: '',
        dob: '',
        address: '',
        teacherPositionsId: [],
        degrees: [{ type: 'Cử nhân', school: '', major: '', year: new Date().getFullYear(), isGraduated: true }],
    });

    const fetchData = async () => {
        setLoading(true);
        try {
        const res = await teacherApi.getAll(page, limit);
        setTeachers(res.data || res.items || res || []);
        setTotal(res.total || (Array.isArray(res) ? res.length : 0));
        } catch (err) {
        console.error(err.message);
        } finally {
        setLoading(false);
        }
    };

    const loadPositions = async () => {
        try {
        const res = await positionApi.getAll();
        setPositions(res.data || res || []);
        } catch (err) {
        console.error(err.message);
        }
    };

    useEffect(() => {
        fetchData();
        loadPositions();
    }, [page, limit]);

    const handleDegreeChange = (index, field, value) => {
        const updated = [...formData.degrees];
        updated[index][field] = value;
        setFormData({ ...formData, degrees: updated });
    };

    const addDegree = () => {
        setFormData({
        ...formData,
        degrees: [...formData.degrees, { type: 'Cử nhân', school: '', major: '', year: new Date().getFullYear(), isGraduated: true }],
        });
    };

    const handleSubmitTeacher = async (e) => {
        e.preventDefault();
        try {
        await teacherApi.create(formData);
        alert('Tạo thông tin giáo viên thành công!');
        setIsModalOpen(false);
        fetchData();
        } catch (err) {
        alert(err.message);
        }
    };

    return (
        <div className="p-6 bg-[#f4f5f7] min-h-screen text-slate-800 font-sans">
        <div className="flex justify-end items-center gap-3 mb-6">
            <div className="relative w-64">
            <input
                type="text"
                placeholder="Tìm kiếm thông tin"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
            />
            <span className="absolute left-2.5 top-1.5 text-gray-400 text-xs">🔍</span>
            </div>
            <button
            onClick={fetchData}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 flex items-center gap-1"
            >
            🔄 Tải lại
            </button>
            <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-[#4f46e5] text-white rounded text-xs hover:bg-indigo-700 flex items-center gap-1 font-medium"
            >
            ➕ Tạo mới
            </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] text-slate-600 font-semibold border-b border-gray-200">
                <tr>
                <th className="p-3.5">Mã</th>
                <th className="p-3.5">Giáo viên</th>
                <th className="p-3.5">Trình độ (cao nhất)</th>
                <th className="p-3.5">Bộ môn</th>
                <th className="p-3.5">TT Công tác</th>
                <th className="p-3.5">Địa chỉ</th>
                <th className="p-3.5">Trạng thái</th>
                <th className="p-3.5 text-center">Hành động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {loading ? (
                <tr><td colSpan="8" className="p-6 text-center text-gray-400">Đang tải...</td></tr>
                ) : teachers.length === 0 ? (
                <tr><td colSpan="8" className="p-6 text-center text-gray-400">Chưa có thông tin giáo viên</td></tr>
                ) : (
                teachers.map((item) => {
                    const highestDegree = item.degrees && item.degrees[0];
                    return (
                    <tr key={item._id?.$oid || item._id} className="hover:bg-slate-50">
                        <td className="p-3.5 text-slate-500 font-mono">{item.code}</td>
                        <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border">
                            <img
                                src={item.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (item.userId?.name || item.name)}
                                alt="avatar"
                                className="w-full h-full object-cover"
                            />
                            </div>
                            <div>
                            <div className="font-semibold text-slate-800">{item.userId?.name || item.name || '—'}</div>
                            <div className="text-[11px] text-slate-400">{item.userId?.email || item.email}</div>
                            <div className="text-[11px] text-slate-400">{item.userId?.phoneNumber || item.phoneNumber}</div>
                            </div>
                        </div>
                        </td>
                        <td className="p-3.5">
                        {highestDegree ? (
                            <div>
                            <div className="font-medium text-slate-700">Bậc: {highestDegree.type}</div>
                            <div className="text-[11px] text-slate-400">Chuyên ngành: {highestDegree.major || '—'}</div>
                            </div>
                        ) : (
                            <span className="text-gray-400">N/A</span>
                        )}
                        </td>
                        <td className="p-3.5 text-slate-400">N/A</td>
                        <td className="p-3.5">
                        {item.teacherPositionsId && item.teacherPositionsId.length > 0 ? (
                            item.teacherPositionsId.map((pos, idx) => (
                            <span key={idx} className="block text-slate-700 font-medium">
                                {pos.name || pos}
                            </span>
                            ))
                        ) : (
                            <span className="text-slate-400">N/A</span>
                        )}
                        </td>
                        <td className="p-3.5 text-slate-600">{item.address || item.userId?.address || 'Hà Nội'}</td>
                        <td className="p-3.5">
                        <span className="inline-block px-2 py-0.5 rounded bg-emerald-500 text-white text-[11px] font-medium">
                            Đang công tác
                        </span>
                        </td>
                        <td className="p-3.5 text-center">
                        <button className="text-slate-500 hover:text-indigo-600 text-xs font-medium">
                            👁 Chi tiết
                        </button>
                        </td>
                    </tr>
                    );
                })
                )}
            </tbody>
            </table>
        </div>

        <div className="flex justify-end items-center gap-3 mt-4 text-xs text-slate-500">
            <span>Tổng: <strong className="text-indigo-600">{total}</strong></span>
            <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-2 py-1 border rounded bg-white disabled:opacity-40">‹</button>
            <span className="px-2 py-1 border border-indigo-600 text-indigo-600 bg-indigo-50 font-semibold rounded">{page}</span>
            <button disabled={teachers.length < limit} onClick={() => setPage(p => p + 1)} className="px-2 py-1 border rounded bg-white disabled:opacity-40">›</button>
            </div>
            <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border rounded px-2 py-1 bg-white outline-none"
            >
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            </select>
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center border-b pb-3 mb-6">
                <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <span className="text-slate-400">✕</span> Tạo thông tin giáo viên
                </h2>
                </div>

                <form onSubmit={handleSubmitTeacher} className="space-y-6 text-xs">
                <div className="flex gap-6 items-start">
                    <div className="flex flex-col items-center">
                    <div className="w-28 h-28 bg-slate-100 rounded border flex items-center justify-center overflow-hidden mb-2">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=newTeacher" alt="preview" className="w-full h-full object-cover" />
                    </div>
                    <button type="button" className="px-3 py-1 border rounded text-[11px] text-slate-600 bg-white hover:bg-slate-50">
                        ☁ Chọn ảnh
                    </button>
                    </div>

                    <div className="flex-1 space-y-4">
                    <div className="text-xs font-bold text-indigo-600 border-b pb-1">Thông tin cá nhân</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-slate-600 mb-1"><span className="text-red-500">*</span> Họ và tên</label>
                        <input
                            required
                            type="text"
                            placeholder="VD: Nguyễn Văn A"
                            className="w-full border rounded p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        </div>
                        <div>
                        <label className="block text-slate-600 mb-1"><span className="text-red-500">*</span> Ngày sinh</label>
                        <input
                            required
                            type="date"
                            className="w-full border rounded p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                            value={formData.dob}
                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        />
                        </div>
                        <div>
                        <label className="block text-slate-600 mb-1"><span className="text-red-500">*</span> Số điện thoại</label>
                        <input
                            required
                            type="text"
                            placeholder="Nhập số điện thoại"
                            className="w-full border rounded p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        />
                        </div>
                        <div>
                        <label className="block text-slate-600 mb-1"><span className="text-red-500">*</span> Email</label>
                        <input
                            required
                            type="email"
                            placeholder="example@school.edu.vn"
                            className="w-full border rounded p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        </div>
                        <div>
                        <label className="block text-slate-600 mb-1"><span className="text-red-500">*</span> Số CCCD</label>
                        <input
                            required
                            type="text"
                            placeholder="Nhập số CCCD"
                            className="w-full border rounded p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                            value={formData.identity}
                            onChange={(e) => setFormData({ ...formData, identity: e.target.value })}
                        />
                        </div>
                        <div>
                        <label className="block text-slate-600 mb-1"><span className="text-red-500">*</span> Địa chỉ</label>
                        <input
                            type="text"
                            placeholder="Địa chỉ thường trú"
                            className="w-full border rounded p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                        </div>
                    </div>
                    </div>
                </div>

                <div>
                    <div className="text-xs font-bold text-indigo-600 border-b pb-1 mb-3">Thông tin công tác</div>
                    <div>
                    <label className="block text-slate-600 mb-1"><span className="text-red-500">*</span> Vị trí công tác</label>
                    <select
                        multiple
                        className="w-full border rounded p-2 text-xs outline-none h-20"
                        onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, (o) => o.value);
                        setFormData({ ...formData, teacherPositionsId: selected });
                        }}
                    >
                        {positions.map((pos) => (
                        <option key={pos._id?.$oid || pos._id} value={pos._id?.$oid || pos._id}>
                            {pos.name} ({pos.code})
                        </option>
                        ))}
                    </select>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center border-b pb-1 mb-3">
                    <div className="text-xs font-bold text-indigo-600">Học vị</div>
                    <button type="button" onClick={addDegree} className="text-xs text-indigo-600 font-semibold hover:underline">
                        + Thêm
                    </button>
                    </div>

                    <table className="w-full border rounded text-xs text-left">
                    <thead className="bg-slate-100 text-slate-600">
                        <tr>
                        <th className="p-2 border-b">Bậc</th>
                        <th className="p-2 border-b">Trường</th>
                        <th className="p-2 border-b">Chuyên ngành</th>
                        <th className="p-2 border-b">Trạng thái</th>
                        <th className="p-2 border-b">Tốt nghiệp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.degrees.map((deg, idx) => (
                        <tr key={idx}>
                            <td className="p-2 border-b">
                            <input
                                type="text"
                                value={deg.type}
                                onChange={(e) => handleDegreeChange(idx, 'type', e.target.value)}
                                className="w-full border rounded p-1"
                            />
                            </td>
                            <td className="p-2 border-b">
                            <input
                                type="text"
                                value={deg.school}
                                onChange={(e) => handleDegreeChange(idx, 'school', e.target.value)}
                                className="w-full border rounded p-1"
                            />
                            </td>
                            <td className="p-2 border-b">
                            <input
                                type="text"
                                value={deg.major}
                                onChange={(e) => handleDegreeChange(idx, 'major', e.target.value)}
                                className="w-full border rounded p-1"
                            />
                            </td>
                            <td className="p-2 border-b">
                            <span className="text-emerald-600 font-medium">Hoàn thành</span>
                            </td>
                            <td className="p-2 border-b">
                            <input
                                type="number"
                                value={deg.year}
                                onChange={(e) => handleDegreeChange(idx, 'year', Number(e.target.value))}
                                className="w-16 border rounded p-1 text-center"
                            />
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>

                <div className="flex justify-end gap-3 border-t pt-4">
                    <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-1.5 border rounded text-slate-600 hover:bg-slate-50"
                    >
                    Hủy
                    </button>
                    <button
                    type="submit"
                    className="px-5 py-1.5 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700"
                    >
                    Lưu
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}
        </div>
    );
};

export default TeacherPage;
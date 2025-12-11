import { useEffect, useState } from 'react';

// Cấu hình URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Fallback status nếu API lỗi
const DEFAULT_STATUSES = [
  { id: 1, name: 'In Progress', color: '#3498db' },
  { id: 2, name: 'Completed', color: '#2ecc71' },
  { id: 3, name: 'Failed', color: '#e74c3c' }
];

// Tra cứu màu theo id
const STATUS_COLORS = DEFAULT_STATUSES.reduce((acc, s) => ({ ...acc, [s.id]: s.color }), {});

function App() {
  const [tasks, setTasks] = useState([]);
  const [statuses, setStatuses] = useState(DEFAULT_STATUSES);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStatuses();
    fetchTasks();
  }, []);

  const fetchStatuses = async () => {
    try {
      const res = await fetch(`${API_URL}/statuses`);
      if (!res.ok) throw new Error('Không lấy được danh sách trạng thái');
      const data = await res.json();
      const enriched = data.map((s) => ({ ...s, color: STATUS_COLORS[s.id] || '#64748b' }));
      setStatuses(enriched);
    } catch (error) {
      console.warn('Dùng fallback statuses vì API lỗi:', error);
      setStatuses(DEFAULT_STATUSES);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Lỗi fetch tasks:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatusId(1);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsLoading(true);
    const payload = { title, description, status_id: Number(statusId) };

    try {
      if (editingId) {
        const res = await fetch(`${API_URL}/tasks/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Cập nhật thất bại');
      } else {
        const res = await fetch(`${API_URL}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Tạo mới thất bại');
      }

      resetForm();
      fetchTasks();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatusId(task.status_id || 1);
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Xóa task này?')) return;
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Xóa thất bại');
      if (editingId === taskId) resetForm();
      fetchTasks();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const updateStatus = async (taskId, newStatusId) => {
    const oldTasks = [...tasks];
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status_id: Number(newStatusId) } : t)));

    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}/status/${newStatusId}`, { method: 'PUT' });
      if (!res.ok) throw new Error('Lỗi cập nhật');
    } catch (error) {
      console.error(error);
      alert('Cập nhật thất bại, hoàn tác lại!');
      setTasks(oldTasks);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <header className="text-center space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Task Manager</p>
          <h1 className="text-3xl md:text-4xl font-bold">🚀 Mini Task Manager</h1>
          <p className="text-slate-300">Tạo, sửa, đổi trạng thái và xóa task nhanh chóng.</p>
        </header>

        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-lg">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 focus:border-indigo-300 focus:outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bạn muốn làm gì hôm nay?"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <select
              className="w-full md:w-52 rounded-lg border border-white/20 bg-white/10 px-3 py-3 font-semibold text-white focus:border-indigo-300 focus:outline-none"
              value={statusId}
              onChange={(e) => setStatusId(e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id} className="text-slate-900">{s.name}</option>
              ))}
            </select>
          </div>

          <textarea
            className="mt-3 w-full min-h-[90px] rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 focus:border-indigo-300 focus:outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả chi tiết (tuỳ chọn)"
          />

          <div className="mt-3 flex flex-wrap gap-3">
            <button
              className="rounded-lg bg-indigo-500 px-4 py-3 font-semibold text-white shadow hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-70"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm Task'}
            </button>
            {editingId && (
              <button
                className="rounded-lg border border-white/30 px-4 py-3 font-semibold text-white hover:bg-white/10 focus:outline-none"
                onClick={resetForm}
              >
                Hủy
              </button>
            )}
          </div>
        </div>

        <ul className="space-y-3">
          {tasks.map((task) => {
            const currentStatus = statuses.find((s) => s.id === task.status_id) || statuses[0] || DEFAULT_STATUSES[0];
            return (
              <li
                key={task.id}
                className="bg-white text-slate-900 rounded-xl p-4 shadow-md border border-slate-200"
                style={{ borderLeft: `6px solid ${currentStatus?.color || '#64748b'}` }}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2 md:flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">{task.title}</span>
                      {currentStatus && (
                        <span
                          className="rounded-full px-3 py-1 text-xs font-semibold"
                          style={{ backgroundColor: `${currentStatus.color}1a`, color: currentStatus.color }}
                        >
                          {currentStatus.name}
                        </span>
                      )}
                    </div>
                    {task.description && <p className="text-sm text-slate-600 leading-relaxed">{task.description}</p>}
                  </div>

                  <div className="flex flex-col gap-2 md:items-end">
                    <select
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-indigo-500 focus:outline-none"
                      value={task.status_id}
                      onChange={(e) => updateStatus(task.id, e.target.value)}
                      style={{ color: currentStatus?.color || '#111827', borderColor: currentStatus?.color || '#cbd5e1' }}
                    >
                      {statuses.map((status) => (
                        <option key={status.id} value={status.id} className="text-slate-900">{status.name}</option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <button
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        onClick={() => startEdit(task)}
                      >
                        Sửa
                      </button>
                      <button
                        className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                        onClick={() => deleteTask(task.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {tasks.length === 0 && (
          <p className="text-center text-slate-200">Chưa có công việc nào. Thêm mới ngay!</p>
        )}
      </div>
    </div>
  );
}

export default App;
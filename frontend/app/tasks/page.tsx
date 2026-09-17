'use client';

import { useEffect, useState, useCallback } from 'react';
import { Task } from '@/types/task';
import { Project } from '@/types/project'; 
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useApi } from '@/lib/useApi';
import ConfirmDialog from '@/app/components/ConfirmDialog';
import ErrorBanner from '@/app/components/ErrorBanner';

export default function TasksPage() {
  useAuthGuard();
  const { apiFetch } = useApi();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeModal, setActiveModal] = useState<'NONE' | 'FORM' | 'DELETE'>('NONE');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [projectId, setProjectId] = useState('');
  const fetchTasks = useCallback(async () => {
    try {
      const data = await apiFetch('/tasks');
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu Tasks');
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch]);
  const fetchProjects = useCallback(async () => {
    try {
      const data = await apiFetch('/projects');
      setProjects(data);
    } catch (err) {
      console.error('Không tải được danh sách projects');
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [fetchTasks, fetchProjects]);

  function openAdd() {
    setSelectedTask(null);
    setTitle('');
    setDescription('');
    setStatus('todo');
    setPriority('medium');
    setProjectId('');
    setActiveModal('FORM');
  }

  function openEdit(task: Task) {
    setSelectedTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status || 'todo');
    setPriority(task.priority || 'medium');
    setProjectId(task.projectId.toString());
    setActiveModal('FORM');
  }

  function openDelete(task: Task) {
    setSelectedTask(task);
    setActiveModal('DELETE');
  }

  function closeModal() {
    setActiveModal('NONE');
    setSelectedTask(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const isEdit = !!selectedTask;
    try {
      if (isEdit) {
        await apiFetch(`/tasks/${selectedTask.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ title, description, status, priority }),
        });
      } else {
        await apiFetch('/tasks', {
          method: 'POST',
          body: JSON.stringify({ title, description, priority, projectId: Number(projectId) }),
        });
      }
      closeModal();
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi lưu task');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!selectedTask) return;
    try {
      await apiFetch(`/tasks/${selectedTask.id}`, { method: 'DELETE' });
      closeModal();
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi xóa task');
    }
  }

  const getStatusBadge = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'done': return <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Đã xong</span>;
      case 'in-progress': return <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Đang làm</span>;
      default: return <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Cần làm</span>;
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p?.toLowerCase()) {
      case 'high': return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Cao</span>;
      case 'low': return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Thấp</span>;
      default: return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-500"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Trung bình</span>;
    }
  };

  const getProjectName = (id: number) => {
    const project = projects.find(p => p.id === id);
    return project ? project.projectName : `Project #${id}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-800 font-sans">
      
      <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tasks</h1>
        </div>
        <button
          onClick={openAdd}
          className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Task
        </button>
      </div>

      <ErrorBanner message={error} onClose={() => setError('')} />
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-xs text-gray-500 font-medium uppercase tracking-wider">
                <th className="py-4 px-6 w-1/3">Tiêu đề</th>
                <th className="py-4 px-6">Dự án</th>
                <th className="py-4 px-6 text-center">Trạng thái</th>
                <th className="py-4 px-6 text-center">Độ ưu tiên</th>
                <th className="py-4 px-6 w-24 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">Đang tải dữ liệu...</td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-50 p-4 rounded-full mb-3 text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                      </div>
                      <p className="font-medium text-gray-500">Chưa có task nào</p>
                      <p className="text-xs text-gray-400 mt-1">Bấm "Add Task" để tạo mới.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{task.title}</div>
                      {task.description && (
                        <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">{task.description}</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                        <span className="truncate max-w-[150px]">{getProjectName(task.projectId)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {getStatusBadge(task.status)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(task)} title="Chỉnh sửa" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button onClick={() => openDelete(task)} title="Xóa" className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeModal === 'FORM' && (
        <>
          <div className="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-[2px] transition-opacity" onClick={closeModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden pointer-events-auto border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedTask ? 'Cập nhật công việc' : 'Tạo Tasks mới'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tiêu đề <span className="text-red-500">*</span></label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhật tiêu đề"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-colors"
                    required autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả chi tiết</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nhập mô tả cho task này..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectedTask ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-colors bg-white"
                      >
                        <option value="todo">Cần làm (Todo)</option>
                        <option value="in-progress">Đang làm (In-progress)</option>
                        <option value="done">Đã xong (Done)</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Project <span className="text-red-500">*</span></label>
                      <select
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-colors bg-white"
                        required
                      >
                        <option value="" disabled>-- Chọn project --</option>
                        {projects.length === 0 && <option value="" disabled>Chưa có project nào</option>}
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.projectName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Độ ưu tiên</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-colors bg-white"
                    >
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Cao</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-50">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                    Hủy
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Đang lưu...' : (selectedTask ? 'Lưu thay đổi' : 'Tạo mới')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={activeModal === 'DELETE'}
        title="Xóa project?"
        message={`Bạn có chắc muốn xóa task "${selectedTask?.title}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa ngay"
        onConfirm={handleDeleteConfirm}
        onCancel={closeModal}
      />

    </div>
  );
}
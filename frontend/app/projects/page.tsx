'use client';

import { useEffect, useState, useCallback } from 'react';
import { Project } from '@/types/project';
import { getToken } from '@/lib/auth';
import { useAuthGuard } from '@/lib/useAuthGuard';

export default function ProjectsPage() {
  useAuthGuard();

  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState('');

  const [activeModal, setActiveModal] = useState<'NONE' | 'FORM' | 'DELETE' | 'INVITE'>('NONE');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [ownerId, setOwnerId] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('1');
  const [inviteMsg, setInviteMsg] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);

  const fetchProjects = useCallback(async () => {
    const token = getToken();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setError('Không thể tải danh sách projects');
        return;
      }
      setProjects(await res.json());
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    const token = getToken();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setRoles(await res.json());
    } catch (err) {
      console.error('Không tải được roles');
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchRoles();
  }, [fetchProjects, fetchRoles]);

  function openAdd() {
    setSelectedProject(null);
    setProjectName('');
    setDescription('');
    setOwnerId('');
    setActiveModal('FORM');
  }

  function openEdit(project: Project) {
    setSelectedProject(project);
    setProjectName(project.projectName);
    setDescription(project.description || '');
    setOwnerId(project.ownerId.toString());
    setActiveModal('FORM');
  }

  function openDelete(project: Project) {
    setSelectedProject(project);
    setActiveModal('DELETE');
  }

  function openInvite(project: Project) {
    setSelectedProject(project);
    setInviteEmail('');
    
    // Tự động gán role mặc định nếu có roles, nếu không gán '1'
    if (roles.length > 0) {
      setInviteRoleId(roles[0].id.toString());
    } else {
      setInviteRoleId('1');
    }
    
    setInviteMsg('');
    setActiveModal('INVITE');
  }

  function closeModal() {
    setActiveModal('NONE');
    setSelectedProject(null);
  }

  // --- CÁC HÀM XỬ LÝ API ---
  async function handleSubmitProject(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    const isEdit = !!selectedProject;
    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_URL}/projects/${selectedProject.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/projects`;
    const method = isEdit ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectName, description, ownerId: Number(ownerId) }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert('Lỗi: ' + err.message);
        return;
      }
      closeModal();
      fetchProjects();
    } catch (err) {
      alert('Đã xảy ra lỗi hệ thống');
    }
  }

  async function handleDeleteConfirm() {
    if (!selectedProject) return;
    const token = getToken();
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${selectedProject.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      closeModal();
      fetchProjects();
    } catch (err) {
      alert('Lỗi khi xóa project');
    }
  }

  async function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProject) return;
    
    setIsInviting(true);
    setInviteMsg('');
    const token = getToken();
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/project-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
          email: inviteEmail,
          roleId: Number(inviteRoleId),
        }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        setInviteMsg('Lỗi: ' + err.message);
      } else {
        setInviteMsg('Đã gửi lời mời thành công!');
        setTimeout(closeModal, 1500);
      }
    } catch (err) {
      setInviteMsg('Lỗi kết nối khi gửi lời mời');
    } finally {
      setIsInviting(false);
    }
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6 mt-8">
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-800 font-sans">
      
      <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dự án của bạn</h1>
        </div>
        <button
          onClick={openAdd}
          className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Thêm Project
        </button>
      </div>

      {/* TABLE DANH SÁCH */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-xs text-gray-500 font-medium uppercase tracking-wider">
                <th className="py-3 px-6 w-1/3">Tên dự án</th>
                <th className="py-3 px-6">Mô tả</th>
                <th className="py-3 px-6 w-24 text-center">Owner ID</th>
                <th className="py-3 px-6 w-32 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-50 p-4 rounded-full mb-3">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                      </div>
                      <p className="text-gray-500 font-medium">Chưa có dự án nào</p>
                      <p className="text-xs text-gray-400 mt-1">Bấm "Thêm Project" để bắt đầu.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-3 px-6">
                      <div className="font-medium text-gray-900">{project.projectName}</div>
                    </td>
                    <td className="py-3 px-6 text-gray-500 truncate max-w-xs" title={project.description}>
                      {project.description || <span className="text-gray-400 italic">...</span>}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        {project.ownerId}
                      </span>
                    </td>
                    <td className="py-3 px-6">
   
                      <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openInvite(project)} title="Mời thành viên" className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                        </button>
                        
                        <button onClick={() => openEdit(project)} title="Chỉnh sửa" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>

                        <button onClick={() => openDelete(project)} title="Xóa dự án" className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all">
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
      
      {activeModal !== 'NONE' && (
        <div className="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-[2px] transition-opacity" onClick={closeModal}></div>
      )}

      {activeModal === 'FORM' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden pointer-events-auto border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedProject ? 'Cập nhật dự án' : 'Tạo dự án mới'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            
            <form onSubmit={handleSubmitProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên dự án <span className="text-red-500">*</span></label>
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Vd: Thiết kế web..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                  required autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Dự án này dùng để..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Owner ID <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  placeholder="ID người sở hữu"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 mt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors">
                  {selectedProject ? 'Lưu thay đổi' : 'Tạo dự án'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'INVITE' && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden pointer-events-auto border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Mời vào dự án</h2>
                <p className="text-sm text-gray-500">{selectedProject.projectName}</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            
            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="nguyenvana@example.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  required autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phân quyền</label>
                <select 
                  value={inviteRoleId}
                  onChange={(e) => setInviteRoleId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 bg-white"
                >
                  {roles.length === 0 && <option value="">Chưa có role — tạo ở trang Roles</option>}
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {inviteMsg && (
                <div className={`p-3 rounded-lg text-sm ${inviteMsg.includes('Lỗi') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                  {inviteMsg}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg" disabled={isInviting}>
                  Đóng
                </button>
                <button type="submit" disabled={isInviting || roles.length === 0} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg disabled:opacity-70 disabled:cursor-not-allowed">
                  {isInviting ? 'Đang gửi...' : 'Gửi lời mời'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {activeModal === 'DELETE' && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden pointer-events-auto p-6 text-center border border-gray-100">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xóa dự án?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Bạn có chắc muốn xóa <span className="font-semibold text-gray-800">"{selectedProject.projectName}"</span> không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                Hủy
              </button>
              <button onClick={handleDeleteConfirm} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
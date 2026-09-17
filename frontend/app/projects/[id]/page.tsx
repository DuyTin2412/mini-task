'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useApi } from '@/lib/useApi';
import ErrorBanner from '@/app/components/ErrorBanner';

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
}

interface Member {
  id: number;
  userId: number;
  roleId: number;
  status: string;
}

interface ProjectDetail {
  id: number;
  projectName: string;
  description?: string;
  ownerId: number;
  tasks: Task[];
  members: Member[];
}

interface Tag {
  id: number;
  name: string;
  color?: string;
}

interface TaskTag {
  id: number;
  taskId: number;
  tagId: number;
}

interface Role {
  id: number;
  name: string;
}

// 1. Thêm Interface UserInfo
interface UserInfo {
  id: number;
  username: string;
  email: string;
}

export default function ProjectDetailPage() {
  useAuthGuard();
  const { apiFetch } = useApi();
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [error, setError] = useState('');

  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [taskTagsModal, setTaskTagsModal] = useState<{ open: boolean; task: Task | null }>({ open: false, task: null });
  const [currentTaskTags, setCurrentTaskTags] = useState<TaskTag[]>([]);
  const [taskTagsMap, setTaskTagsMap] = useState<Record<number, Tag[]>>({});
  const [isToggling, setIsToggling] = useState(false);

  const [roles, setRoles] = useState<Role[]>([]);
  
  // 2. Thêm state users
  const [users, setUsers] = useState<UserInfo[]>([]);

  const fetchDetail = useCallback(async () => {
    try {
      const data = await apiFetch(`/projects/${projectId}/detail`);
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải chi tiết project');
    }
  }, [apiFetch, projectId]);

  const fetchAllTags = useCallback(async () => {
    try {
      const data = await apiFetch('/tags');
      setAllTags(data);
    } catch (err) {
      console.error('Lỗi tải danh sách tags:', err);
    }
  }, [apiFetch]);

  const fetchRoles = useCallback(async () => {
    try {
      const data = await apiFetch('/roles');
      setRoles(data);
    } catch (err) {
      console.error('Lỗi tải roles', err);
    }
  }, [apiFetch]);

  // 3. Thêm hàm fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      const data = await apiFetch('/users');
      setUsers(data);
    } catch (err) {
      console.error('Lỗi tải users', err);
    }
  }, [apiFetch]);

  const fetchAllTaskTags = useCallback(async (tasks: Task[], tags: Tag[]) => {
    const map: Record<number, Tag[]> = {};
    await Promise.all(
      tasks.map(async (task) => {
        try {
          const taskTags: TaskTag[] = await apiFetch(`/task-tags/task/${task.id}`);
          const tagsForTask = taskTags
            .map((tt) => tags.find((t) => t.id === tt.tagId))
            .filter((t): t is Tag => !!t);
          map[task.id] = tagsForTask;
        } catch (err) {
          map[task.id] = [];
        }
      })
    );
    setTaskTagsMap(map);
  }, [apiFetch]);

  // 4. Bổ sung fetchUsers vào useEffect
  useEffect(() => {
    fetchDetail();
    fetchAllTags();
    fetchRoles();
    fetchUsers();
  }, [fetchDetail, fetchAllTags, fetchRoles, fetchUsers]);

  useEffect(() => {
    if (project && allTags.length > 0) {
      fetchAllTaskTags(project.tasks, allTags);
    }
  }, [project, allTags, fetchAllTaskTags]);

  // --- HÀM TRỢ GIÚP ---
  function getRoleName(roleId: number) {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.name : `Role ${roleId}`;
  }

  // 5. Hàm lấy thông tin User
  function getUserInfo(userId: number) {
    const user = users.find((u) => u.id === userId);
    return user || { username: `User ${userId}`, email: '' };
  }

  async function openTaskTags(task: Task) {
    setTaskTagsModal({ open: true, task });
    try {
      const data = await apiFetch(`/task-tags/task/${task.id}`);
      setCurrentTaskTags(data);
    } catch (err) {
      setCurrentTaskTags([]);
    }
  }

  function closeTaskTags() {
    setTaskTagsModal({ open: false, task: null });
    setCurrentTaskTags([]);
  }

  function isTagAttached(tagId: number) {
    return currentTaskTags.some((tt) => tt.tagId === tagId);
  }

  async function toggleTag(tagId: number) {
    if (!taskTagsModal.task || isToggling) return;
    setIsToggling(true);
    const existing = currentTaskTags.find((tt) => tt.tagId === tagId);
    try {
      if (existing) {
        await apiFetch(`/task-tags/${existing.id}`, { method: 'DELETE' });
      } else {
        await apiFetch('/task-tags', {
          method: 'POST',
          body: JSON.stringify({ taskId: taskTagsModal.task.id, tagId }),
        });
      }
      
      const data = await apiFetch(`/task-tags/task/${taskTagsModal.task.id}`);
      setCurrentTaskTags(data);
      
      if (project && allTags.length > 0) {
        fetchAllTaskTags(project.tasks, allTags); 
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi cập nhật tag');
    } finally {
      setIsToggling(false);
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

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 mt-8">
        <ErrorBanner message={error} onClose={() => setError('')} />
        <button onClick={() => router.push('/projects')} className="text-sm text-blue-600 hover:underline">
          &larr; Quay lại danh sách
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-500 text-sm font-medium">Đang tải dữ liệu dự án...</p>
      </div>
    );
  }

  // Khai báo thông tin Owner để dùng cho giao diện
  const ownerInfo = getUserInfo(project.ownerId);

  return (
    <div className="max-w-7xl mx-auto p-6 text-gray-800 font-sans">
      <button
        onClick={() => router.push('/projects')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 -ml-3 mb-4 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Quay lại dự án
      </button>

      <div className="flex items-start gap-4 mb-8 border-b border-gray-100 pb-6">
        <div className="bg-gradient-to-tr from-blue-600 to-blue-400 p-3 rounded-xl shadow-sm text-white flex-shrink-0 mt-1">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{project.projectName}</h1>
          <p className="text-base text-gray-500 mt-1 max-w-2xl leading-relaxed">
            {project.description || <span className="italic text-gray-400">Không có mô tả cho dự án này</span>}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Projects <span className="text-gray-400 font-normal text-sm ml-1">({project.tasks.length})</span>
            </h2>
          </div>

          {project.tasks.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 border border-gray-200 border-dashed rounded-xl">
              <div className="flex justify-center mb-3">
                <div className="bg-white p-3 rounded-full shadow-sm text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </div>
              </div>
              <p className="text-gray-500 font-medium">Chưa có công việc nào</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-xs text-gray-500 font-medium uppercase tracking-wider">
                      <th className="py-3.5 px-6">Tiêu đề</th>
                      <th className="py-3.5 px-6">Nhãn (Tags)</th>
                      <th className="py-3.5 px-6 text-center">Trạng thái</th>
                      <th className="py-3.5 px-6 text-center">Độ ưu tiên</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100">
                    {project.tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="py-3.5 px-6 font-medium text-gray-900">{task.title}</td>
                        <td className="py-3.5 px-6 min-w-[200px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(taskTagsMap[task.id] || []).map((tag) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border"
                                style={{ backgroundColor: `${tag.color}15`, borderColor: `${tag.color}40`, color: tag.color }}
                              >
                                {tag.name}
                              </span>
                            ))}
                            <button
                              onClick={() => openTaskTags(task)}
                              title="Gắn nhãn (Tags)"
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-gray-300 text-gray-400 hover:text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-6 text-center">{getStatusBadge(task.status)}</td>
                        <td className="py-3.5 px-6 text-center">{getPriorityBadge(task.priority)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Thành viên <span className="text-gray-400 font-normal text-sm ml-1">({project.members.length + 1})</span>
            </h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100 overflow-hidden">
            
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs uppercase">
                  {ownerInfo.username.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">{ownerInfo.username}</span>
                  {ownerInfo.email && (
                    <span className="text-xs text-gray-400">{ownerInfo.email}</span>
                  )}
                </div>
              </div>
              <span className="text-xs bg-amber-50 text-amber-700 font-medium px-2.5 py-1 rounded-md border border-amber-200">
                Owner
              </span>
            </div>

            {project.members.map((member) => {
              const memberInfo = getUserInfo(member.userId);
              return (
                <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                      {memberInfo.username.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{memberInfo.username}</span>
                      {memberInfo.email && (
                        <span className="text-xs text-gray-400">{memberInfo.email}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 font-medium px-2.5 py-1 rounded-md border border-gray-200 uppercase">
                    {getRoleName(member.roleId)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {taskTagsModal.open && taskTagsModal.task && (
        <>
          <div className="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-[2px] transition-opacity" onClick={closeTaskTags} />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden pointer-events-auto border border-gray-100">
              
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Gắn nhãn (Tags)
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 font-medium truncate max-w-[280px]">
                    Task: {taskTagsModal.task.title}
                  </p>
                </div>
                <button onClick={closeTaskTags} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">Click vào nhãn bên dưới để gắn hoặc gỡ khỏi công việc này:</p>
                
                {allTags.length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    Chưa có nhãn nào trong hệ thống. Hãy tạo ở trang Tags.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {allTags.map((tag) => {
                      const attached = isTagAttached(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => toggleTag(tag.id)}
                          disabled={isToggling}
                          className={`
                            group flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border
                            ${attached 
                              ? 'border-indigo-200 bg-indigo-50 text-indigo-800 shadow-sm ring-1 ring-indigo-500/20' 
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                            }
                            ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          <span 
                            className="w-2.5 h-2.5 rounded-full shadow-sm"
                            style={{ backgroundColor: tag.color || '#e5e7eb' }}
                          />
                          {tag.name}
                          
                          {attached ? (
                            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={closeTaskTags}
                  className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                >
                  Hoàn tất
                </button>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
}
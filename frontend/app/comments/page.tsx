'use client';

import { useEffect, useState, useCallback } from 'react';
import { getToken } from '@/lib/auth';
import { useAuthGuard } from '@/lib/useAuthGuard';

interface Comment {
  id: number;
  comment: string;
  taskId: number;
  userId: number;
}

export default function CommentsPage() {
  useAuthGuard();

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<'NONE' | 'FORM' | 'DELETE'>('NONE');
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [commentText, setCommentText] = useState('');
  const [taskId, setTaskId] = useState('');
  const [userId, setUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchComments = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setComments(await res.json());
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách comments', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  function openAdd() {
    setCommentText('');
    setTaskId('');
    setUserId('');
    setActiveModal('FORM');
  }

  function openDelete(comment: Comment) {
    setSelectedComment(comment);
    setActiveModal('DELETE');
  }

  function closeModal() {
    setActiveModal('NONE');
    setSelectedComment(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const token = getToken();
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          comment: commentText,
          taskId: Number(taskId),
          userId: Number(userId),
        }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        alert('Lỗi: ' + err.message);
        setIsSubmitting(false);
        return;
      }
      
      closeModal();
      fetchComments();
    } catch (error) {
      alert('Đã xảy ra lỗi khi tạo Comment');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!selectedComment) return;
    setIsSubmitting(true);
    const token = getToken();
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${selectedComment.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      closeModal();
      fetchComments();
    } catch (error) {
      alert('Lỗi khi xóa comment');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-800 font-sans">
      <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Comments</h1>
        </div>
        <button
          onClick={openAdd}
          className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Comment
        </button>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-xs text-gray-500 font-medium uppercase tracking-wider">
                <th className="py-3 px-6 w-16 text-center">ID</th>
                <th className="py-3 px-6">Nội dung</th>
                <th className="py-3 px-6 w-32 text-center">Task ID</th>
                <th className="py-3 px-6 w-32 text-center">User ID</th>
                <th className="py-3 px-6 w-24 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">Đang tải dữ liệu...</td>
                </tr>
              ) : comments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-50 p-4 rounded-full mb-3 text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                      </div>
                      <p className="font-medium text-gray-500">Chưa có bình luận nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                comments.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-6 text-center text-gray-500">#{c.id}</td>
                    <td className="py-4 px-6">
                      <div className="text-gray-900 line-clamp-2" title={c.comment}>
                        {c.comment}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Task #{c.taskId}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        User #{c.userId}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openDelete(c)} 
                          title="Xóa bình luận" 
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                        >
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
              <h2 className="text-lg font-semibold text-gray-900">Add Comment</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nội dung <span className="text-red-500">*</span></label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Nhập nội dung bình luận..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors resize-none"
                  required autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Task ID <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    placeholder=""
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">User ID <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="VD: 2"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-gray-50">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                  Hủy
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Đang tạo...' : 'Gửi bình luận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {activeModal === 'DELETE' && selectedComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden pointer-events-auto p-6 text-center border border-gray-100">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xóa bình luận?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Bạn có chắc muốn xóa bình luận này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                Hủy
              </button>
              <button 
                onClick={handleDeleteConfirm} 
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Đang xóa...' : 'Xóa ngay'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useApi } from '@/lib/useApi';
import ConfirmDialog from '@/app/components/ConfirmDialog';
import ErrorBanner from '@/app/components/ErrorBanner';

interface Tag {
  id: number;
  name: string;
  color?: string;
}

export default function TagsPage() {
  useAuthGuard();
  const { apiFetch } = useApi();

  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeModal, setActiveModal] = useState<'NONE' | 'FORM' | 'DELETE'>('NONE');
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');

  const fetchTags = useCallback(async () => {
    try {
      const data = await apiFetch('/tags');
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  function openAdd() {
    setSelectedTag(null);
    setName('');
    setColor('#3B82F6');
    setActiveModal('FORM');
  }

  function openEdit(tag: Tag) {
    setSelectedTag(tag);
    setName(tag.name);
    setColor(tag.color || '#3B82F6');
    setActiveModal('FORM');
  }

  function openDelete(tag: Tag) {
    setSelectedTag(tag);
    setActiveModal('DELETE');
  }

  function closeModal() {
    setActiveModal('NONE');
    setSelectedTag(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const isEdit = !!selectedTag;
    try {
      if (isEdit) {
        await apiFetch(`/tags/${selectedTag.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name, color }),
        });
      } else {
        await apiFetch('/tags', {
          method: 'POST',
          body: JSON.stringify({ name, color }),
        });
      }
      closeModal();
      fetchTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi lưu tag');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!selectedTag) return;
    setIsSubmitting(true);
    try {
      await apiFetch(`/tags/${selectedTag.id}`, { method: 'DELETE' });
      closeModal();
      fetchTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi xóa tag');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800 font-sans">
      
      <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nhãn (Tags)</h1>
          <p className="text-sm text-gray-500 mt-1">Phân loại và gắn màu cho các công việc</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Thêm Tag
        </button>
      </div>

      <ErrorBanner message={error} onClose={() => setError('')} />

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-xs text-gray-500 font-medium uppercase tracking-wider">
              <th className="py-3 px-6 w-20 text-center">ID</th>
              <th className="py-3 px-6">Tag & Màu sắc</th>
              <th className="py-3 px-6 w-32 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="py-12 text-center text-gray-400">Đang tải dữ liệu...</td>
              </tr>
            ) : tags.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-16 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-gray-50 p-4 rounded-full mb-3 text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                    </div>
                    <p className="font-medium text-gray-500">Chưa có tag nào</p>
                    <p className="text-xs text-gray-400 mt-1">Bấm "Thêm Tag" để tạo mới.</p>
                  </div>
                </td>
              </tr>
            ) : (
              tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-4 px-6 text-center text-gray-400 font-mono text-xs">#{tag.id}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span 
                        className="w-3.5 h-3.5 rounded-full shadow-sm border border-black/10 flex-shrink-0"
                        style={{ backgroundColor: tag.color || '#e5e7eb' }}
                      ></span>
                      <span className="font-medium text-gray-900">{tag.name}</span>
                      <span className="text-xs text-gray-400 font-mono uppercase bg-gray-100 px-1.5 py-0.5 rounded hidden sm:inline-block">
                        {tag.color}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(tag)} title="Chỉnh sửa" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button onClick={() => openDelete(tag)} title="Xóa" className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all">
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
      {activeModal === 'FORM' && (
        <>
          <div className="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-[2px] transition-opacity" onClick={closeModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden pointer-events-auto border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedTag ? 'Cập nhật tag' : 'Tạo tag mới'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên tag <span className="text-red-500">*</span></label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: bug, urgent, frontend..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-colors"
                    required autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Màu sắc</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-12 h-10 p-1 bg-white border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={color} 
                      onChange={(e) => setColor(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-colors font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-50">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                    Hủy
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Đang lưu...' : (selectedTag ? 'Lưu thay đổi' : 'Tạo mới')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={activeModal === 'DELETE'}
        title="Xóa tag?"
        message={`Bạn có chắc muốn xóa tag "${selectedTag?.name}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa ngay"
        onConfirm={handleDeleteConfirm}
        onCancel={closeModal}
      />
    </div>
  );
}
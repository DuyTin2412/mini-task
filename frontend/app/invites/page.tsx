'use client';

import { useEffect, useState, useCallback } from 'react';
import { getToken } from '@/lib/auth';
import { useAuthGuard } from '@/lib/useAuthGuard';

interface Invite {
  id: number;
  projectId: number;
  userId: number;
  roleId: number;
  status: string;
}

export default function InvitesPage() {
  useAuthGuard();

  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const getRoleName = (roleId: number) => {
    switch (roleId) {
      case 1: return 'Viewer (Chỉ xem)';
      case 2: return 'Editor (Chỉnh sửa)';
      case 3: return 'Admin (Quản trị)';
      default: return `Role ${roleId}`;
    }
  };

  const fetchInvites = useCallback(async () => {
    try {
      const token = getToken();
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      
      const user = JSON.parse(userStr);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/project-members/invites/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      
      if (res.ok) {
        const data = await res.json();
        setInvites(data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách lời mời:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  async function respond(id: number, status: 'accepted' | 'declined') {
    const token = getToken();
    try {
      if (status === 'declined') {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/project-members/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/project-members/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        });
      }
      fetchInvites();
    } catch (error) {
      alert('Đã xảy ra lỗi khi phản hồi lời mời.');
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800 font-sans">
        
      <div className="mb-8 border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Invites</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Đang tải dữ liệu...</div>
      ) : invites.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 border-dashed rounded-xl">
          <div className="flex justify-center mb-3">
            <div className="bg-gray-50 p-4 rounded-full text-gray-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
          </div>
          <p className="text-gray-500 font-medium">Bạn chưa có lời mời nào</p>
          <p className="text-sm text-gray-400 mt-1">Khi ai đó mời bạn vào dự án, thông báo sẽ xuất hiện ở đây.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {invites.map((invite) => (
            <li 
              key={invite.id} 
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-gray-300 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="flex items-start gap-4">
                {/* Icon Hộp thư/Thông báo */}
                <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                
                {/* Nội dung lời mời */}
                <div>
                  <p className="text-gray-900 font-medium">
                    Bạn được mời tham gia <span className="font-semibold">Project #{invite.projectId}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-sm text-gray-500">Vai trò:</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      {getRoleName(invite.roleId)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nút thao tác */}
              <div className="flex w-full sm:w-auto gap-2">
                <button
                  onClick={() => respond(invite.id, 'declined')}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:border-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Từ chối
                </button>
                <button
                  onClick={() => respond(invite.id, 'accepted')}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg shadow-sm transition-colors"
                >
                  Chấp nhận
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
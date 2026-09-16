'use client';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  intent?: 'danger' | 'primary'; 
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  intent = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const isDanger = intent === 'danger';

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden pointer-events-auto p-6 text-center border border-gray-100 transform transition-all">
  
          <div className={`mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-5 ${isDanger ? 'bg-red-50' : 'bg-blue-50'}`}>
            {isDanger ? (
              <svg className="h-7 w-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="h-7 w-7 text-[#2A74BD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2 tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            {message}
          </p>
          
          <div className="flex gap-3">
            <button 
              onClick={onCancel} 
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              {cancelText}
            </button>
            
            <button 
              onClick={onConfirm} 
              className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                isDanger 
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-600/20' 
                  : 'bg-[#2A74BD] hover:bg-blue-700 focus:ring-blue-500 shadow-blue-600/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
          
        </div>
      </div>
    </>
  );
}
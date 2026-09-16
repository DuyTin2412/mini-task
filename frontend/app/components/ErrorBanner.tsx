'use client';

interface ErrorBannerProps {
  message: string;
  onClose?: () => void; 
}

export default function ErrorBanner({ message, onClose }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-100 rounded-xl shadow-sm">
      
      <svg 
        className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      
      <div className="flex-1 text-sm font-medium text-red-700 leading-relaxed">
        {message}
      </div>

      {onClose && (
        <button 
          onClick={onClose}
          type="button"
          className="flex-shrink-0 p-1 text-red-400 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"
          title="Đóng thông báo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      
    </div>
  );
}
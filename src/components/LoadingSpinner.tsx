import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  type?: 'spinner' | 'dots' | 'bars';
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  type = 'spinner',
  message = '',
  size = 'medium'
}) => {
  const getSpinnerSize = () => {
    switch (size) {
      case 'small': return '40px';
      case 'medium': return '60px';
      case 'large': return '80px';
      default: return '60px';
    }
  };

  const renderSpinner = () => {
    switch (type) {
      case 'spinner':
        return (
          <div
            className="spinner"
            style={{
              width: getSpinnerSize(),
              height: getSpinnerSize(),
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
        );
      case 'dots':
        return (
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-blue-500 rounded-full"
                style={{
                  animation: 'bounce 1.4s infinite ease-in-out',
                  animationDelay: `${i * 0.16}s`
                }}
              />
            ))}
          </div>
        );
      case 'bars':
        return (
          <div className="flex gap-1 h-10">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-1.5 bg-blue-500"
                style={{
                  animation: 'stretch 1.2s infinite ease-in-out',
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <div className={fullScreen ? 'fixed inset-0 bg-white/90 flex flex-col items-center justify-center z-50' : 'flex flex-col items-center justify-center p-8'}>
      {renderSpinner()}
      {message && (
        <p className={`mt-4 ${fullScreen ? 'text-gray-800' : 'text-gray-600'}`}>
          {message}
        </p>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        @keyframes stretch {
          0%, 40%, 100% { transform: scaleY(0.4); }
          20% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};
import React from 'react';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onRetry }) => {
  const handleKeyDown = (e: React.KeyboardEvent, action?: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action?.();
    }
  };

  return (
    <div 
      className="error-alert"
      role="alert"
      aria-live="assertive"
    >
      <div className="error-content">
        <div className="error-icon-container">
          <svg 
            className="error-icon" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
            width="16"
            height="16"
          >
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="error-message-container">
          <p className="error-message">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            onKeyDown={(e) => handleKeyDown(e, onRetry)}
            className="error-retry-btn"
            aria-label="Retry"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};
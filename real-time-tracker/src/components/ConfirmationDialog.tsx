import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '⚠️',
          confirmColor: '#dc3545',
          confirmBg: '#dc3545',
          confirmHover: '#c82333',
          borderColor: '#f5c6cb'
        };
      case 'warning':
        return {
          icon: '⚠️',
          confirmColor: '#ffc107',
          confirmBg: '#ffc107',
          confirmHover: '#e0a800',
          borderColor: '#ffeaa7'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          confirmColor: '#007bff',
          confirmBg: '#007bff',
          confirmHover: '#0056b3',
          borderColor: '#b3d7ff'
        };
      default:
        return {
          icon: '⚠️',
          confirmColor: '#ffc107',
          confirmBg: '#ffc107',
          confirmHover: '#e0a800',
          borderColor: '#ffeaa7'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={onCancel}
      >
        {/* Dialog */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            animation: 'slideIn 0.3s ease-out',
            border: `2px solid ${styles.borderColor}`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '24px' }}>{styles.icon}</span>
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: '#212529'
            }}>
              {title}
            </h3>
          </div>

          {/* Message */}
          <p style={{
            margin: '0 0 24px 0',
            fontSize: '14px',
            lineHeight: '1.5',
            color: '#495057'
          }}>
            {message}
          </p>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#6c757d',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.borderColor = '#adb5bd';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#dee2e6';
              }}
            >
              {cancelText}
            </button>
            
            <button
              onClick={onConfirm}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                border: '1px solid transparent',
                borderRadius: '6px',
                backgroundColor: styles.confirmBg,
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = styles.confirmHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = styles.confirmBg;
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes slideIn {
            from {
              transform: translateY(-20px) scale(0.95);
              opacity: 0;
            }
            to {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </>
  );
}; 
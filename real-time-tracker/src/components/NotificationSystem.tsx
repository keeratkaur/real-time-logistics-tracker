import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { clearSuccessMessage, clearError, retryAction, clearActionHistory } from '../store/driversSlice';

export const NotificationSystem: React.FC = () => {
  const dispatch = useAppDispatch();
  const { error, successMessage, actionHistory, pendingActions } = useAppSelector(state => state.drivers);

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleRetry = (driverId: number) => {
    dispatch(retryAction(driverId));
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'failed') => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'success':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: 'pending' | 'success' | 'failed') => {
    switch (status) {
      case 'pending':
        return '#ffc107';
      case 'success':
        return '#28a745';
      case 'failed':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  return (
    <>
      {/* Success Notification Toast */}
      {successMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          padding: '16px 20px',
          color: '#155724',
          fontSize: '14px',
          fontWeight: '500',
          zIndex: 10000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'slideInRight 0.3s ease-out',
          maxWidth: '400px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '18px' }}>✅</span>
          <span>{successMessage}</span>
          <button
            onClick={() => dispatch(clearSuccessMessage())}
            style={{
              background: 'none',
              border: 'none',
              color: '#155724',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px',
              borderRadius: '4px',
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#c3e6cb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Notification with Retry Options */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          padding: '16px 20px',
          color: '#721c24',
          fontSize: '14px',
          zIndex: 10000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'slideInLeft 0.3s ease-out',
          maxWidth: '500px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <span style={{ fontSize: '18px', marginTop: '2px' }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                Action Failed
              </div>
              <div style={{ marginBottom: '12px' }}>
                {error}
              </div>
              
              {/* Retry buttons for pending actions */}
              {Object.keys(pendingActions).length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  {Object.entries(pendingActions).map(([driverId, action]) => (
                    <button
                      key={driverId}
                      onClick={() => handleRetry(Number(driverId))}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        border: '1px solid #721c24',
                        borderRadius: '4px',
                        backgroundColor: '#721c24',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#5a1a1a';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#721c24';
                      }}
                    >
                      🔄 Retry Driver {driverId}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => dispatch(clearError())}
              style={{
                background: 'none',
                border: 'none',
                color: '#721c24',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5c6cb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Action History Panel */}
      {actionHistory.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'white',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          maxWidth: '400px',
          maxHeight: '300px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '1px solid #e9ecef'
          }}>
            <h4 style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: '600',
              color: '#495057'
            }}>
              📋 Recent Actions
            </h4>
            <button
              onClick={() => dispatch(clearActionHistory())}
              style={{
                background: 'none',
                border: 'none',
                color: '#6c757d',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Clear
            </button>
          </div>
          
          <div style={{
            overflowY: 'auto',
            maxHeight: '200px'
          }}>
            {actionHistory.slice(0, 10).map((action) => (
              <div
                key={action.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 0',
                  borderBottom: '1px solid #f8f9fa',
                  fontSize: '12px'
                }}
              >
                <span style={{ fontSize: '14px' }}>
                  {getStatusIcon(action.status)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: '500',
                    color: '#495057',
                    marginBottom: '2px'
                  }}>
                    {action.driverName}
                  </div>
                  <div style={{
                    color: '#6c757d',
                    fontSize: '11px'
                  }}>
                    {action.action} • {new Date(action.timestamp).toLocaleTimeString()}
                  </div>
                  {action.error && (
                    <div style={{
                      color: '#dc3545',
                      fontSize: '10px',
                      marginTop: '2px'
                    }}>
                      {action.error}
                    </div>
                  )}
                </div>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(action.status)
                }} />
              </div>
            ))}
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes slideInLeft {
            from {
              transform: translateX(-100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </>
  );
}; 
import React, { useState } from 'react';
import { Driver } from '../types/driver';
import { selectDriver } from '../store/uiSlice';
import { pauseDriver, completeDelivery, reassignDriver, retryAction } from '../store/driversSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { ConfirmationDialog } from './ConfirmationDialog';

interface DriverListItemProps {
  driver: Driver;
}

export const DriverListItem: React.FC<DriverListItemProps> = ({ driver }) => {
  const dispatch = useAppDispatch();
  const selectedDriverId = useAppSelector((state) => state.ui.selectedDriverId);
  const pendingActions = useAppSelector((state) => state.drivers.pendingActions);
  
  // Confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    action: 'pause' | 'complete' | 'reassign' | null;
    title: string;
    message: string;
    type: 'warning' | 'danger' | 'info';
  }>({
    isOpen: false,
    action: null,
    title: '',
    message: '',
    type: 'warning'
  });
  
  const isSelected = selectedDriverId === driver.id;
  const isPending = pendingActions[driver.id] !== undefined;
  const pendingAction = pendingActions[driver.id];
  
  const getStatusColor = (status: Driver['status']) => {
    switch (status) {
      case 'Delivering':
        return 'var(--success-500)';
      case 'Paused':
        return 'var(--warning-500)';
      case 'Idle':
        return 'var(--gray-500)';
      default:
        return 'var(--gray-500)';
    }
  };

  const getStatusIcon = (status: Driver['status']) => {
    switch (status) {
      case 'Delivering':
        return '🚚';
      case 'Paused':
        return '⏸️';
      case 'Idle':
        return '💤';
      default:
        return '❓';
    }
  };

  const handleClick = () => {
    dispatch(selectDriver(isSelected ? null : driver.id));
  };

  const showConfirmation = (action: 'pause' | 'complete' | 'reassign') => {
    const confirmations = {
      pause: {
        title: 'Pause Driver',
        message: `Are you sure you want to pause ${driver.name}? This will stop their current delivery.`,
        type: 'warning' as const
      },
      complete: {
        title: 'Complete Delivery',
        message: `Are you sure you want to mark ${driver.name}'s delivery as complete? This action cannot be undone.`,
        type: 'danger' as const
      },
      reassign: {
        title: 'Reassign Driver',
        message: `Are you sure you want to reassign ${driver.name} to a new delivery?`,
        type: 'info' as const
      }
    };

    setConfirmationDialog({
      isOpen: true,
      action,
      ...confirmations[action]
    });
  };

  const handleConfirmAction = () => {
    if (!confirmationDialog.action) return;
    
    switch (confirmationDialog.action) {
      case 'pause':
        dispatch(pauseDriver(driver.id));
        break;
      case 'complete':
        dispatch(completeDelivery(driver.id));
        break;
      case 'reassign':
        dispatch(reassignDriver(driver.id));
        break;
    }
    
    setConfirmationDialog({ isOpen: false, action: null, title: '', message: '', type: 'warning' });
  };

  const handleCancelConfirmation = () => {
    setConfirmationDialog({ isOpen: false, action: null, title: '', message: '', type: 'warning' });
  };

  const handlePauseDriver = (e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirmation('pause');
  };

  const handleCompleteDelivery = (e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirmation('complete');
  };

  const handleReassignDriver = (e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirmation('reassign');
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(retryAction(driver.id));
  };

  const isActionDisabled = (actionType: string) => {
    if (!isPending) return false;
    return pendingAction?.action === actionType;
  };

  const getButtonText = (actionType: string) => {
    if (isActionDisabled(actionType)) {
      return pendingAction?.retryCount && pendingAction.retryCount > 0 
        ? `⏳ Retry ${pendingAction.retryCount}/3` 
        : '⏳';
    }
    switch (actionType) {
      case 'pause':
        return '⏸️ Pause';
      case 'complete':
        return '✅ Complete';
      case 'reassign':
        return '🔄 Reassign';
      default:
        return '';
    }
  };

  return (
    <>
      <div
        className={`driver-list-item ${isSelected ? 'selected' : ''} ${isPending ? 'pending' : ''}`}
        onClick={handleClick}
      >
        {/* Pending indicator */}
        {isPending && (
          <div className="pending-indicator" />
        )}

        {/* Retry indicator for failed actions */}
        {isPending && pendingAction?.retryCount && pendingAction.retryCount > 0 && (
          <div className="retry-indicator">
            Retry {pendingAction.retryCount}/3
          </div>
        )}

        <div className="driver-item-header">
          <div className="driver-info">
            <div className="driver-name-section">
              <span className="status-icon">
                {getStatusIcon(driver.status)}
              </span>
              <h3 className="driver-name">
                {driver.name}
              </h3>
              {isPending && (
                <span className="pending-status">
                  ⏳ {pendingAction?.action === 'pause' ? 'Pausing...' :
                      pendingAction?.action === 'complete' ? 'Completing...' :
                      pendingAction?.action === 'reassign' ? 'Reassigning...' : 'Processing...'}
                </span>
              )}
            </div>
            
            <div className="driver-status-section">
              <div 
                className="status-dot"
                style={{ backgroundColor: getStatusColor(driver.status) }}
              />
              <span className="status-text">
                {driver.status}
              </span>
              {driver.eta && (
                <span className="eta-badge">
                  ETA: {driver.eta}
                </span>
              )}
            </div>
          </div>
          
          <div className="driver-details">
            <div className="driver-id">ID: {driver.id}</div>
            <div className="driver-location">
              {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            onClick={handlePauseDriver}
            disabled={isActionDisabled('pause')}
            className={`action-button pause ${isActionDisabled('pause') ? 'disabled' : ''}`}
          >
            {getButtonText('pause')}
          </button>

          <button
            onClick={handleCompleteDelivery}
            disabled={isActionDisabled('complete')}
            className={`action-button complete ${isActionDisabled('complete') ? 'disabled' : ''}`}
          >
            {getButtonText('complete')}
          </button>

          <button
            onClick={handleReassignDriver}
            disabled={isActionDisabled('reassign')}
            className={`action-button reassign ${isActionDisabled('reassign') ? 'disabled' : ''}`}
          >
            {getButtonText('reassign')}
          </button>

          {/* Retry button for failed actions */}
          {isPending && pendingAction?.retryCount && pendingAction.retryCount > 0 && (
            <button
              onClick={handleRetry}
              className="action-button retry"
            >
              🔄 Retry
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        type={confirmationDialog.type}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelConfirmation}
        confirmText="Yes, proceed"
        cancelText="Cancel"
      />
    </>
  );
}; 
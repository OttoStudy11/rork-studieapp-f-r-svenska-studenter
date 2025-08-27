import createContextHook from '@nkzw/create-context-hook';
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, AlertCircle, Info, X, Zap } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'info' | 'achievement';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const ToastComponent: React.FC<{
  toast: Toast;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const insets = useSafeAreaInsets();
  const [slideAnim] = useState(new Animated.Value(-100));
  const [opacityAnim] = useState(new Animated.Value(0));

  const handleDismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(toast.id);
    });
  }, [slideAnim, opacityAnim, onDismiss, toast.id]);

  React.useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      handleDismiss();
    }, toast.duration || 4000);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [slideAnim, opacityAnim, handleDismiss, toast.duration]);



  const getToastConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: CheckCircle,
          backgroundColor: '#10B981',
          borderColor: '#059669',
        };
      case 'error':
        return {
          icon: AlertCircle,
          backgroundColor: '#EF4444',
          borderColor: '#DC2626',
        };
      case 'info':
        return {
          icon: Info,
          backgroundColor: '#3B82F6',
          borderColor: '#2563EB',
        };
      case 'achievement':
        return {
          icon: Zap,
          backgroundColor: '#F59E0B',
          borderColor: '#D97706',
        };
      default:
        return {
          icon: Info,
          backgroundColor: '#6B7280',
          borderColor: '#4B5563',
        };
    }
  };

  const config = getToastConfig();
  const IconComponent = config.icon;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          top: insets.top + 10,
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.toastContent}>
        <View style={styles.toastIcon}>
          <IconComponent size={20} color="white" />
        </View>
        <View style={styles.toastText}>
          <Text style={styles.toastTitle}>{toast.title}</Text>
          {toast.message && (
            <Text style={styles.toastMessage}>{toast.message}</Text>
          )}
        </View>
        {toast.action && (
          <TouchableOpacity
            style={styles.toastAction}
            onPress={toast.action.onPress}
          >
            <Text style={styles.toastActionText}>{toast.action.label}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
        >
          <X size={16} color="rgba(255, 255, 255, 0.8)" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export const [ToastProvider, useToast] = createContextHook(() => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      ...toastData,
    };

    setToasts(prev => [...prev, newToast]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  const showAchievement = useCallback((title: string, message?: string) => {
    showToast({ type: 'achievement', title, message });
  }, [showToast]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const ToastContainer = useCallback(() => (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map(toast => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onDismiss={dismissToast}
        />
      ))}
    </View>
  ), [toasts, dismissToast]);

  return useMemo(() => ({
    showToast,
    showSuccess,
    showError,
    showInfo,
    showAchievement,
    ToastContainer,
  }), [showToast, showSuccess, showError, showInfo, showAchievement, ToastContainer]);
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10000,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  toastIcon: {
    marginRight: 12,
  },
  toastText: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  toastAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  toastActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  dismissButton: {
    marginLeft: 8,
    padding: 4,
  },
});
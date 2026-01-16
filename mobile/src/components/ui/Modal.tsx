import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal as RNModal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { borderRadius, fontSize, fontWeight, spacing, shadows } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export default function Modal({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  size = 'md',
}: ModalProps) {
  const { themeColors } = useTheme();
  const translateY = useSharedValue(SCREEN_HEIGHT);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 150,
      });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { maxHeight: SCREEN_HEIGHT * 0.4 };
      case 'lg':
        return { maxHeight: SCREEN_HEIGHT * 0.85 };
      case 'full':
        return { height: SCREEN_HEIGHT * 0.95 };
      default:
        return { maxHeight: SCREEN_HEIGHT * 0.7 };
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modal,
                { backgroundColor: themeColors.backgroundCard },
                getSizeStyle(),
                animatedStyle,
              ]}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
                  {title && (
                    <Text style={[styles.title, { color: themeColors.text }]}>
                      {title}
                    </Text>
                  )}
                  {showCloseButton && (
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <Ionicons name="close" size={24} color={themeColors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Content */}
              <View style={styles.content}>{children}</View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

// Alert Modal Component
interface AlertModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function AlertModal({
  visible,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'Tamam',
  cancelText,
  onConfirm,
  onCancel,
}: AlertModalProps) {
  const { themeColors } = useTheme();

  const getTypeIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} showCloseButton={false} size="sm">
      <View style={styles.alertContent}>
        <Ionicons name={getTypeIcon()} size={48} color={getTypeColor()} />
        <Text style={[styles.alertTitle, { color: themeColors.text }]}>{title}</Text>
        <Text style={[styles.alertMessage, { color: themeColors.textSecondary }]}>
          {message}
        </Text>
        
        <View style={styles.alertButtons}>
          {cancelText && (
            <TouchableOpacity
              style={[styles.alertButton, styles.alertCancelButton, { borderColor: themeColors.border }]}
              onPress={() => {
                onCancel?.();
                onClose();
              }}
            >
              <Text style={[styles.alertButtonText, { color: themeColors.textSecondary }]}>
                {cancelText}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.alertButton,
              styles.alertConfirmButton,
              { backgroundColor: getTypeColor() },
            ]}
            onPress={() => {
              onConfirm?.();
              onClose();
            }}
          >
            <Text style={[styles.alertButtonText, { color: '#fff' }]}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  alertContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  alertTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  alertButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  alertButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  alertCancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  alertConfirmButton: {},
  alertButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});

import { Alert, Platform } from 'react-native';

// Polyfill Alert.alert for React Native for Web
if (Platform.OS === 'web') {
  Alert.alert = (
    title: string,
    message?: string,
    buttons?: Array<{
      text?: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>
  ) => {
    const text = [title, message].filter(Boolean).join('\n\n');

    if (!buttons || buttons.length <= 1) {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(text);
      }
      if (buttons && buttons[0]?.onPress) {
        buttons[0].onPress();
      }
      return;
    }

    // Has multiple buttons (confirm/cancel)
    const cancelBtn = buttons.find((b) => b.style === 'cancel');
    const actionBtn =
      buttons.find((b) => b.style === 'destructive') ||
      buttons.find((b) => b.style !== 'cancel') ||
      buttons[buttons.length - 1];

    if (typeof window !== 'undefined' && window.confirm) {
      const confirmed = window.confirm(text);
      if (confirmed) {
        actionBtn?.onPress?.();
      } else {
        cancelBtn?.onPress?.();
      }
    } else {
      actionBtn?.onPress?.();
    }
  };
}

export function showConfirmDialog(
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>,
  confirmText: string = 'Confirm'
) {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm) {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmText, style: 'destructive', onPress: onConfirm },
  ]);
}

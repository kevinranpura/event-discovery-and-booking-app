import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '../types';
import { COLORS } from '../constants';
import { formatDate } from '../utils/helpers';

const NOTIFICATION_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  booking_confirmed: 'checkmark-circle',
  booking_cancelled: 'close-circle',
  event_reminder: 'alarm',
  event_update: 'information-circle',
  default: 'notifications',
};

const NOTIFICATION_COLORS: Record<string, string> = {
  booking_confirmed: COLORS.success,
  booking_cancelled: COLORS.error,
  event_reminder: COLORS.warning,
  event_update: COLORS.primary,
  default: COLORS.textMuted,
};

interface NotificationCardProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
}

export function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const type = notification.type || 'default';
  const icon = NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.default;
  const color = NOTIFICATION_COLORS[type] || NOTIFICATION_COLORS.default;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(notification)}
      activeOpacity={0.8}
      style={[styles.card, !notification.is_read && styles.cardUnread]}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, !notification.is_read && styles.titleUnread]}>
            {notification.title}
          </Text>
          {!notification.is_read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.message} numberOfLines={2}>{notification.message}</Text>
        <Text style={styles.time}>{formatDate(notification.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  cardUnread: {
    borderColor: COLORS.primary + '35',
    backgroundColor: COLORS.primaryLight,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600', flex: 1 },
  titleUnread: { color: COLORS.text, fontWeight: '700' },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 6,
  },
  message: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18, marginBottom: 5 },
  time: { color: COLORS.textDim, fontSize: 11 },
});

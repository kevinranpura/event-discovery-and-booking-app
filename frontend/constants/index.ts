export const COLORS = {
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  primaryDark: '#3730A3',
  secondary: '#6366F1',
  accent: '#D97706',
  success: '#059669',
  successLight: '#ECFDF5',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceLight: '#F1F5F9',
  surfaceSubtle: '#F8FAFC',
  border: '#E2E8F0',
  borderLight: '#EDF2F7',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textDim: '#94A3B8',
  white: '#FFFFFF',
  cardShadow: 'rgba(15, 23, 42, 0.06)',
};

export const CATEGORY_COLORS: Record<string, string> = {
  Music: '#7C3AED',
  Sports: '#059669',
  Technology: '#2563EB',
  Business: '#D97706',
  Education: '#0284C7',
  Workshops: '#DB2777',
  Entertainment: '#EA580C',
  Arts: '#DC2626',
  Food: '#65A30D',
  Networking: '#4F46E5',
};

export const STATUS_COLORS: Record<string, string> = {
  confirmed: '#059669',
  pending: '#D97706',
  cancelled: '#DC2626',
  completed: '#4F46E5',
};

export interface CategoryItem {
  id: string;
  name: string;
  iconName: string;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'all', name: 'All', iconName: 'grid-outline' },
  { id: 'music', name: 'Music', iconName: 'musical-notes-outline' },
  { id: 'sports', name: 'Sports', iconName: 'football-outline' },
  { id: 'technology', name: 'Technology', iconName: 'hardware-chip-outline' },
  { id: 'business', name: 'Business', iconName: 'briefcase-outline' },
  { id: 'education', name: 'Education', iconName: 'school-outline' },
  { id: 'workshops', name: 'Workshops', iconName: 'construct-outline' },
  { id: 'entertainment', name: 'Entertainment', iconName: 'film-outline' },
];

export const TICKET_TYPES = ['General', 'VIP', 'Early Bird', 'Student'] as const;

export const TICKET_MULTIPLIERS: Record<string, number> = {
  General: 1.0,
  VIP: 1.8,
  'Early Bird': 0.8,
  Student: 0.7,
};

export const TICKET_DETAILS: Record<string, { label: string; tag: string; description: string }> = {
  General: {
    label: 'General Admission',
    tag: 'Standard',
    description: 'Regular event access & standard seating',
  },
  VIP: {
    label: 'VIP Experience',
    tag: 'Premium',
    description: 'Priority check-in, premium seating & lounge access',
  },
  'Early Bird': {
    label: 'Early Bird',
    tag: '20% OFF',
    description: 'Discounted advance booking while seats last',
  },
  Student: {
    label: 'Student Pass',
    tag: '30% OFF',
    description: 'Discounted entry for students (ID check at gate)',
  },
};

export const API_URL =
  typeof window !== 'undefined'
    ? 'http://localhost:3000'
    : process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';


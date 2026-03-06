export const COLORS = {
  primary: '#1B5E20',
  primaryLight: '#4CAF50',
  primaryDark: '#0D3B13',
  gold: '#F9A825',
  red: '#D32F2F',
  cream: '#FFF8E1',
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray: '#757575',
  grayLight: '#E0E0E0',
  background: '#F5F5F5',
} as const;

export const EFFORT_CONFIG = {
  easy: {
    label: 'Easy',
    color: '#4CAF50',
    pinColor: 'green',
    pointRange: '5-15',
  },
  medium: {
    label: 'Medium',
    color: '#F9A825',
    pinColor: '#F9A825',
    pointRange: '15-30',
  },
  hard: {
    label: 'Hard',
    color: '#D32F2F',
    pinColor: 'red',
    pointRange: '30-50',
  },
} as const;

export const DEFAULT_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

import { Platform } from 'react-native';

export interface StyleProps {
  style?: any;
  className?: string;
}

// Platform detection
export const isWeb = Platform.OS === 'web';
export const isNative = !isWeb;

// Style merging utility
export const mergeStyles = (styles: any[]): any => {
  if (isWeb) {
    return styles.filter(Boolean).join(' ');
  }
  return styles.filter(Boolean);
};

// Convert web-like style object to platform-agnostic style
export const createStyle = (webClassName: string, nativeStyle: any): any => {
  if (isWeb) {
    return webClassName;
  }
  return nativeStyle;
};

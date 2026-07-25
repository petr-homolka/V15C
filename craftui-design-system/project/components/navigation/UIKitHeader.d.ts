import * as React from 'react';
export interface UIKitHeaderProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Title". */
  text1?: string;
}
export declare const UIKitHeader: React.FC<UIKitHeaderProps>;
export default UIKitHeader;

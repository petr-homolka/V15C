import * as React from 'react';
export interface NavigationMobileTopBarProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "". */
  text1?: string;
  /** Text content; defaults to "". */
  text2?: string;
  /** Text content; defaults to "Page title". */
  text3?: string;
}
export declare const NavigationMobileTopBar: React.FC<NavigationMobileTopBarProps>;
export default NavigationMobileTopBar;

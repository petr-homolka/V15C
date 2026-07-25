import * as React from 'react';
export interface NavigationWebTopBarProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "". */
  text1?: string;
  /** Text content; defaults to "". */
  text2?: string;
  /** Text content; defaults to "". */
  text3?: string;
  /** Text content; defaults to "Page title". */
  text4?: string;
}
export declare const NavigationWebTopBar: React.FC<NavigationWebTopBarProps>;
export default NavigationWebTopBar;

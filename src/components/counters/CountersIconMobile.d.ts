import * as React from 'react';
export interface CountersIconMobileProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "". */
  text1?: string;
  /** Text content; defaults to "". */
  text2?: string;
  /** Text content; defaults to "1.345". */
  text3?: string;
  /** Text content; defaults to "New sales". */
  text4?: string;
}
export declare const CountersIconMobile: React.FC<CountersIconMobileProps>;
export default CountersIconMobile;

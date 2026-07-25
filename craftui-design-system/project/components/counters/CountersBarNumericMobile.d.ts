import * as React from 'react';
export interface CountersBarNumericMobileProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "". */
  text1?: string;
  /** Text content; defaults to "1.345". */
  text2?: string;
  /** Text content; defaults to "Sales". */
  text3?: string;
}
export declare const CountersBarNumericMobile: React.FC<CountersBarNumericMobileProps>;
export default CountersBarNumericMobile;

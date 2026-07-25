import * as React from 'react';
export interface CountersNumericWithIconWebProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "". */
  text1?: string;
  /** Text content; defaults to "Employees". */
  text2?: string;
  /** Text content; defaults to "1.345". */
  text3?: string;
}
export declare const CountersNumericWithIconWeb: React.FC<CountersNumericWithIconWebProps>;
export default CountersNumericWithIconWeb;

import * as React from 'react';
export interface CountersBarNumericWebProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "1.345". */
  text1?: string;
  /** Text content; defaults to "". */
  text2?: string;
  /** Text content; defaults to "Week comparison". */
  text3?: string;
  /** Text content; defaults to "Sales". */
  text4?: string;
}
export declare const CountersBarNumericWeb: React.FC<CountersBarNumericWebProps>;
export default CountersBarNumericWeb;

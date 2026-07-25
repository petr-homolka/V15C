import * as React from 'react';
export interface CountersIconWebProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "". */
  text1?: string;
  /** Text content; defaults to "1.345". */
  text2?: string;
  /** Text content; defaults to "New sales". */
  text3?: string;
}
export declare const CountersIconWeb: React.FC<CountersIconWebProps>;
export default CountersIconWeb;

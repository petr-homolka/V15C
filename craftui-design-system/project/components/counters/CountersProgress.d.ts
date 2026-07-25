import * as React from 'react';
export interface CountersProgressProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "85%". */
  text1?: string;
  /** Text content; defaults to "1.345". */
  text2?: string;
  /** Text content; defaults to "New sales". */
  text3?: string;
}
export declare const CountersProgress: React.FC<CountersProgressProps>;
export default CountersProgress;

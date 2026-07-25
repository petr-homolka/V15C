import * as React from 'react';
export interface CountersGraphWebProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "New tasks". */
  text1?: string;
  /** Text content; defaults to "345". */
  text2?: string;
}
export declare const CountersGraphWeb: React.FC<CountersGraphWebProps>;
export default CountersGraphWeb;

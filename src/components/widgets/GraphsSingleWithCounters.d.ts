import * as React from 'react';
export interface GraphsSingleWithCountersProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "". */
  text1?: string;
  /** Text content; defaults to "Income Details". */
  text2?: string;
  /** Text content; defaults to "$342.000". */
  text3?: string;
  /** Text content; defaults to "$142.000". */
  text4?: string;
}
export declare const GraphsSingleWithCounters: React.FC<GraphsSingleWithCountersProps>;
export default GraphsSingleWithCounters;

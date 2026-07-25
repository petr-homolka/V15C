import * as React from 'react';
export interface GraphsScheduledWebProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Jan". */
  text1?: string;
  /** Text content; defaults to "Feb". */
  text2?: string;
  /** Text content; defaults to "Mar". */
  text3?: string;
  /** Text content; defaults to "Apr". */
  text4?: string;
}
export declare const GraphsScheduledWeb: React.FC<GraphsScheduledWebProps>;
export default GraphsScheduledWeb;

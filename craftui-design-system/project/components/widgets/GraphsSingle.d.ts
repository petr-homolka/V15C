import * as React from 'react';
export interface GraphsSingleProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "March". */
  text1?: string;
  /** Text content; defaults to "$48.200". */
  text2?: string;
  /** Text content; defaults to "Jan". */
  text3?: string;
  /** Text content; defaults to "Feb". */
  text4?: string;
}
export declare const GraphsSingle: React.FC<GraphsSingleProps>;
export default GraphsSingle;

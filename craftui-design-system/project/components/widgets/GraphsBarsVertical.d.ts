import * as React from 'react';
export interface GraphsBarsVerticalProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Week to week performance". */
  text1?: string;
  /** Text content; defaults to "Conversion history". */
  text2?: string;
}
export declare const GraphsBarsVertical: React.FC<GraphsBarsVerticalProps>;
export default GraphsBarsVertical;

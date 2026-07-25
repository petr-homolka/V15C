import * as React from 'react';
export interface WidgetsGraphsPieProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "". */
  text1?: string;
  /** Text content; defaults to "Income Breakdown". */
  text2?: string;
  /** Text content; defaults to "16%". */
  text3?: string;
  /** Text content; defaults to "$85k". */
  text4?: string;
}
export declare const WidgetsGraphsPie: React.FC<WidgetsGraphsPieProps>;
export default WidgetsGraphsPie;

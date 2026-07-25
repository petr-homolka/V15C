import * as React from 'react';
export interface GraphsPieSidebarWithCountersProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "$342.000". */
  text1?: string;
  /** Text content; defaults to "$200.000". */
  text2?: string;
  /** Text content; defaults to "Total sales". */
  text3?: string;
  /** Text content; defaults to "Spendings". */
  text4?: string;
}
export declare const GraphsPieSidebarWithCounters: React.FC<GraphsPieSidebarWithCountersProps>;
export default GraphsPieSidebarWithCounters;

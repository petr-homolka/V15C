import * as React from 'react';
export interface GraphsGraphSidebarProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Week to week performance". */
  text1?: string;
  /** Text content; defaults to "Conversion history". */
  text2?: string;
}
export declare const GraphsGraphSidebar: React.FC<GraphsGraphSidebarProps>;
export default GraphsGraphSidebar;

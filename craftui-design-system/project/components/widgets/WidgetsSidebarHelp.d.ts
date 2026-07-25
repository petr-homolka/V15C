import * as React from 'react';
export interface WidgetsSidebarHelpProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Moreover the striking, brilliant and vivid colors". */
  text1?: string;
  /** Text content; defaults to "Ticket #2020-1021". */
  text2?: string;
  /** Text content; defaults to "". */
  text3?: string;
}
export declare const WidgetsSidebarHelp: React.FC<WidgetsSidebarHelpProps>;
export default WidgetsSidebarHelp;

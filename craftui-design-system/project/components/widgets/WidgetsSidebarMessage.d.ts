import * as React from 'react';
export interface WidgetsSidebarMessageProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Moreover the striking, brilliant and vivid colors". */
  text1?: string;
  /** Text content; defaults to "10m". */
  text2?: string;
  /** Text content; defaults to "Nicholas Gordon". */
  text3?: string;
}
export declare const WidgetsSidebarMessage: React.FC<WidgetsSidebarMessageProps>;
export default WidgetsSidebarMessage;

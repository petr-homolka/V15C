import * as React from 'react';
export interface WidgetsSidebarEventProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "10m". */
  text1?: string;
  /** Text content; defaults to "Nicholas Gordon". */
  text2?: string;
  /** Text content; defaults to "". */
  text3?: string;
}
export declare const WidgetsSidebarEvent: React.FC<WidgetsSidebarEventProps>;
export default WidgetsSidebarEvent;

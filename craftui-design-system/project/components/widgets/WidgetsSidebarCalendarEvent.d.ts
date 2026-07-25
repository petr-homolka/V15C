import * as React from 'react';
export interface WidgetsSidebarCalendarEventProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "". */
  text1?: string;
  /** Text content; defaults to "Tell how to boost website traffic". */
  text2?: string;
  /** Text content; defaults to "Meeting with a client". */
  text3?: string;
  /** Text content; defaults to "05:48AM". */
  text4?: string;
}
export declare const WidgetsSidebarCalendarEvent: React.FC<WidgetsSidebarCalendarEventProps>;
export default WidgetsSidebarCalendarEvent;

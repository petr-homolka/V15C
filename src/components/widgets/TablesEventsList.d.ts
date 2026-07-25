import * as React from 'react';
export interface TablesEventsListProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Latest Events". */
  text1?: string;
  /** Text content; defaults to "Event". */
  text2?: string;
  /** Text content; defaults to "Details". */
  text3?: string;
  /** Text content; defaults to "$118.00". */
  text4?: string;
}
export declare const TablesEventsList: React.FC<TablesEventsListProps>;
export default TablesEventsList;

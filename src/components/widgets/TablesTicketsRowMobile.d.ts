import * as React from 'react';
export interface TablesTicketsRowMobileProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Differentiate Yourself". */
  text1?: string;
  /** Text content; defaults to "Ticket #2020-1021". */
  text2?: string;
  /** Text content; defaults to "". */
  text3?: string;
}
export declare const TablesTicketsRowMobile: React.FC<TablesTicketsRowMobileProps>;
export default TablesTicketsRowMobile;

import * as React from 'react';
export interface DashboardEmptyProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Messages". */
  text1?: string;
  /** Text content; defaults to "Welcome,". */
  text2?: string;
  /** Text content; defaults to "CRAFTUI". */
  text3?: string;
  /** Text content; defaults to "There is no data to display.\nSetup your business.". */
  text4?: string;
}
export declare const DashboardEmpty: React.FC<DashboardEmptyProps>;
export default DashboardEmpty;

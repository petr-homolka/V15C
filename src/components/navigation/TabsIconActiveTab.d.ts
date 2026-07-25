import * as React from 'react';
export interface TabsIconActiveTabProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Tab 1". */
  text1?: string;
  /** Text content; defaults to "". */
  text2?: string;
}
export declare const TabsIconActiveTab: React.FC<TabsIconActiveTabProps>;
export default TabsIconActiveTab;

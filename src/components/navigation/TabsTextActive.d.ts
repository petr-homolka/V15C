import * as React from 'react';
export interface TabsTextActiveProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Tab Title". */
  text1?: string;
}
export declare const TabsTextActive: React.FC<TabsTextActiveProps>;
export default TabsTextActive;

import * as React from 'react';
export interface TablesFilesListWebProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "". */
  text1?: string;
  /** Text content; defaults to "Employee". */
  text2?: string;
  /** Text content; defaults to "+5". */
  text3?: string;
  /** Text content; defaults to "Developer". */
  text4?: string;
}
export declare const TablesFilesListWeb: React.FC<TablesFilesListWebProps>;
export default TablesFilesListWeb;

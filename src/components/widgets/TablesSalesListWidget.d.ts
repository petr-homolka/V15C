import * as React from 'react';
export interface TablesSalesListWidgetProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "". */
  text1?: string;
  /** Text content; defaults to "Orders". */
  text2?: string;
  /** Text content; defaults to "2.480 Total Orders". */
  text3?: string;
  /** Text content; defaults to "$118.00". */
  text4?: string;
}
export declare const TablesSalesListWidget: React.FC<TablesSalesListWidgetProps>;
export default TablesSalesListWidget;

import * as React from 'react';
export interface TablesSalesSmallListWidgetProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Product". */
  text1?: string;
  /** Text content; defaults to "Customer". */
  text2?: string;
  /** Text content; defaults to "Delivery". */
  text3?: string;
  /** Text content; defaults to "Total". */
  text4?: string;
}
export declare const TablesSalesSmallListWidget: React.FC<TablesSalesSmallListWidgetProps>;
export default TablesSalesSmallListWidget;

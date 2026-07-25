import * as React from 'react';
export interface TablesInvoicesListWidgetProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "1.520 Total Invoices". */
  text1?: string;
  /** Text content; defaults to "$118.00". */
  text2?: string;
  /** Text content; defaults to "Paid". */
  text3?: string;
  /** Text content; defaults to "Invoice #AA-04-19-1890678". */
  text4?: string;
}
export declare const TablesInvoicesListWidget: React.FC<TablesInvoicesListWidgetProps>;
export default TablesInvoicesListWidget;

import * as React from 'react';
export interface PaginationPrimaryProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "1". */
  text1?: string;
  /** Text content; defaults to "2". */
  text2?: string;
  /** Text content; defaults to "3". */
  text3?: string;
  /** Text content; defaults to "4". */
  text4?: string;
}
export declare const PaginationPrimary: React.FC<PaginationPrimaryProps>;
export default PaginationPrimary;

import * as React from 'react';
export interface ButtonsFiltersProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "". */
  text1?: string;
  /** Text content; defaults to "SORT:". */
  text2?: string;
  /** Text content; defaults to "a-z". */
  text3?: string;
  /** Text content; defaults to "". */
  text4?: string;
}
export declare const ButtonsFilters: React.FC<ButtonsFiltersProps>;
export default ButtonsFilters;

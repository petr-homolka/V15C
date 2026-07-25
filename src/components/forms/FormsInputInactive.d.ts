import * as React from 'react';
export interface FormsInputInactiveProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Start typing…". */
  text1?: string;
  /** Text content; defaults to "". */
  text2?: string;
  /** Text content; defaults to "Field title". */
  text3?: string;
}
export declare const FormsInputInactive: React.FC<FormsInputInactiveProps>;
export default FormsInputInactive;

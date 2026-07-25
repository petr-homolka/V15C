import * as React from 'react';
export interface FormsInputDisabledProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Start typing…". */
  text1?: string;
  /** Text content; defaults to "". */
  text2?: string;
  /** Text content; defaults to "Field title". */
  text3?: string;
}
export declare const FormsInputDisabled: React.FC<FormsInputDisabledProps>;
export default FormsInputDisabled;

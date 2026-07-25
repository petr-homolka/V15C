import * as React from 'react';
export interface FormsInputStatesErrorWithProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Start typing…". */
  text1?: string;
  /** Text content; defaults to "Field title". */
  text2?: string;
  /** Text content; defaults to "". */
  text3?: string;
}
export declare const FormsInputStatesErrorWith: React.FC<FormsInputStatesErrorWithProps>;
export default FormsInputStatesErrorWith;

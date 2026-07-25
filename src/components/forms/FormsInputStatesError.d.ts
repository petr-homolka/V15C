import * as React from 'react';
export interface FormsInputStatesErrorProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Start typing…". */
  text1?: string;
  /** Text content; defaults to "Field title". */
  text2?: string;
}
export declare const FormsInputStatesError: React.FC<FormsInputStatesErrorProps>;
export default FormsInputStatesError;

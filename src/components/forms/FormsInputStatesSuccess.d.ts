import * as React from 'react';
export interface FormsInputStatesSuccessProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Start typing…". */
  text1?: string;
  /** Text content; defaults to "Field title". */
  text2?: string;
}
export declare const FormsInputStatesSuccess: React.FC<FormsInputStatesSuccessProps>;
export default FormsInputStatesSuccess;

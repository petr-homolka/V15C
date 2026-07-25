import * as React from 'react';
export interface RecoverProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Lost your password?\nEnter your details to recover.". */
  text1?: string;
  /** Text content; defaults to "Enter your details to proceed further". */
  text2?: string;
  /** Text content; defaults to "Or sign in with". */
  text3?: string;
}
export declare const Recover: React.FC<RecoverProps>;
export default Recover;

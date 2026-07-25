import * as React from 'react';
export interface FormsInputActiveBasicProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Start typing…". */
  text1?: string;
  /** Text content; defaults to "Field title". */
  text2?: string;
}
export declare const FormsInputActiveBasic: React.FC<FormsInputActiveBasicProps>;
export default FormsInputActiveBasic;

import * as React from 'react';
export interface FinishProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Registration complete.\nSubscribe to our newsletters.". */
  text1?: string;
  /** Text content; defaults to "Now you can setup your projects and teams". */
  text2?: string;
}
export declare const Finish: React.FC<FinishProps>;
export default Finish;

import * as React from 'react';
export interface ButtonsLinkButtonActiveProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "". */
  text1?: string;
  /** Text content; defaults to "Link". */
  text2?: string;
}
export declare const ButtonsLinkButtonActive: React.FC<ButtonsLinkButtonActiveProps>;
export default ButtonsLinkButtonActive;

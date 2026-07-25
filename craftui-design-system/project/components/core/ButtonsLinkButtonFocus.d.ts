import * as React from 'react';
export interface ButtonsLinkButtonFocusProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "". */
  text1?: string;
  /** Text content; defaults to "Link". */
  text2?: string;
}
export declare const ButtonsLinkButtonFocus: React.FC<ButtonsLinkButtonFocusProps>;
export default ButtonsLinkButtonFocus;

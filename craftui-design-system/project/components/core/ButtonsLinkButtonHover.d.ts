import * as React from 'react';
export interface ButtonsLinkButtonHoverProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "". */
  text1?: string;
  /** Text content; defaults to "Link". */
  text2?: string;
}
export declare const ButtonsLinkButtonHover: React.FC<ButtonsLinkButtonHoverProps>;
export default ButtonsLinkButtonHover;

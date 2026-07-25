import * as React from 'react';
export interface BadgeOvalProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "5". */
  text1?: string;
}
export declare const BadgeOval: React.FC<BadgeOvalProps>;
export default BadgeOval;

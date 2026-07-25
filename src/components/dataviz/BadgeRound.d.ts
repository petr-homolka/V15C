import * as React from 'react';
export interface BadgeRoundProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "5". */
  text1?: string;
}
export declare const BadgeRound: React.FC<BadgeRoundProps>;
export default BadgeRound;

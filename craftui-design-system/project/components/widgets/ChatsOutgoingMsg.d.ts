import * as React from 'react';
export interface ChatsOutgoingMsgProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "8:20 PM". */
  text1?: string;
  /** Text content; defaults to "Freelance Design Tricks". */
  text2?: string;
}
export declare const ChatsOutgoingMsg: React.FC<ChatsOutgoingMsgProps>;
export default ChatsOutgoingMsg;

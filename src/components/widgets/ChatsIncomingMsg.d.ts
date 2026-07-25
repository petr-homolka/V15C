import * as React from 'react';
export interface ChatsIncomingMsgProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "8:00 PM". */
  text1?: string;
  /** Text content; defaults to "Ever wondered how some graphic designers always manage to produce". */
  text2?: string;
}
export declare const ChatsIncomingMsg: React.FC<ChatsIncomingMsgProps>;
export default ChatsIncomingMsg;

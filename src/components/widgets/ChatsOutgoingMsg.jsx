// figma node: 12070:2138 Chats / Outgoing Msg
export function ChatsOutgoingMsg(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 217,
      height: 57,
      position: "relative",
      color: "rgb(238,238,238)",
      ...props.style,
    }}>
      <span style={{
        position: "absolute",
        left: 137,
        top: 38,
        width: 46,
        height: 18,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 12,
        textAlign: "right",
        whiteSpace: "nowrap",
        lineHeight: "18px",
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? "8:20 PM"}</span>
      <div style={{
        position: "absolute",
        left: 193,
        top: 4.5,
        width: 24,
        height: 24,
        overflow: "hidden",
      }}>
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 24,
          height: 24,
        }}>
          <path d={"M 12 24 C 18.627 24 24 18.627 24 12 C 24 5.373 18.627 0 12 0 C 5.373 0 0 5.373 0 12 C 0 18.627 5.373 24 12 24 Z"} fill="currentColor" fillRule="evenodd" />
        </svg>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 24,
          height: 24,
          clipPath: "inset(0px 0px 0px 0px)",
        }}>
          <div style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 26.4,
            height: 26.4,
          }} />
        </div>
      </div>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 184,
        height: 34,
        borderRadius: "17px 17px 0px 17px",
        backgroundColor: "rgb(94,129,244)",
      }} />
      <span style={{
        position: "absolute",
        left: 22,
        top: 5,
        width: 145,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        textAlign: "right",
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(255,255,255)",
      }}>{props.text2 ?? "Freelance Design Tricks"}</span>
    </div>
  );
}
export default ChatsOutgoingMsg;

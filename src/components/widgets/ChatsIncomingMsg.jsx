// figma node: 12070:2130 Chats / Incoming Msg
export function ChatsIncomingMsg(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 522,
      height: 58,
      position: "relative",
      color: "rgb(238,238,238)",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 6,
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
            top: -0.214,
            width: 24,
            height: 24.214,
          }} />
        </div>
      </div>
      <span style={{
        position: "absolute",
        left: 32,
        top: 39,
        width: 46,
        height: 18,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 12,
        whiteSpace: "nowrap",
        lineHeight: "18px",
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? "8:00 PM"}</span>
      <div style={{
        position: "absolute",
        left: 32,
        top: 0,
        width: 462,
        height: 34,
        borderRadius: "18.500px 18.500px 18.500px 0px",
        backgroundColor: "rgb(245,245,250)",
      }} />
      <span style={{
        position: "absolute",
        left: 47,
        top: 6,
        width: 431,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(28,29,33)",
      }}>{props.text2 ?? "Ever wondered how some graphic designers always manage to produce"}</span>
    </div>
  );
}
export default ChatsIncomingMsg;

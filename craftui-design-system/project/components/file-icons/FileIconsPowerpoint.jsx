// figma node: 12070:2240 File Icons / Powerpoint
export function FileIconsPowerpoint(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 58,
      height: 68,
      position: "relative",
      color: "rgb(255,128,139)",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 57.8,
        height: 68,
        borderRadius: 8,
        background: "linear-gradient(rgba(255,128,139,0.1),rgba(255,128,139,0.1)), linear-gradient(rgb(255,255,255),rgb(255,255,255))",
      }} />
      <svg width={14.167} height={25.500} viewBox="0 0 14.167 25.500" fill="none" style={{
        position: "absolute",
        left: 22.1,
        top: 22.1,
        width: 14.167,
        height: 25.5,
      }}>
        <path d={"M 0 24.083 C 0 24.866 0.634 25.5 1.417 25.5 C 2.199 25.5 2.833 24.866 2.833 24.083 L 2.833 17 L 7.083 17 C 10.995 17 14.167 13.828 14.167 9.917 L 14.167 7.083 C 14.167 3.171 10.995 0 7.083 0 L 1.417 0 C 0.634 0 0 0.634 0 1.417 L 0 24.083 Z M 7.083 14.167 L 2.833 14.167 L 2.833 2.833 L 7.083 2.833 C 9.431 2.833 11.333 4.736 11.333 7.083 L 11.333 9.917 C 11.333 12.264 9.431 14.167 7.083 14.167 Z"} fill="currentColor" fillRule="evenodd" />
      </svg>
    </div>
  );
}
export default FileIconsPowerpoint;

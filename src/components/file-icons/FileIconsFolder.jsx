// figma node: 12070:2222 File Icons / Folder
export function FileIconsFolder(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 58,
      height: 68,
      position: "relative",
      color: "rgb(44,229,246)",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 57.8,
        height: 68,
        borderRadius: 8,
        background: "linear-gradient(rgba(64,225,250,0.1),rgba(64,225,250,0.1)), linear-gradient(rgb(255,255,255),rgb(255,255,255))",
      }} />
      <svg width={24.650} height={13.175} viewBox="0 0 24.650 13.175" fill="none" style={{
        position: "absolute",
        left: 17.85,
        top: 31.663,
        width: 24.65,
        height: 13.175,
      }}>
        <path d={"M 5.1 0 C 4.992 0 4.897 0.073 4.869 0.177 L 0 12.325 L 0 12.75 C 0 13.062 -0.02 13.175 0.24 13.175 L 19.263 13.175 C 19.754 13.175 20.187 12.844 20.304 12.404 L 24.65 0.425 C 24.65 0.425 24.65 0.159 24.65 0 L 5.1 0 Z"} fill="currentColor" fillRule="nonzero" />
      </svg>
      <svg width={22.950} height={18.924} viewBox="0 0 22.950 18.924" fill="none" style={{
        position: "absolute",
        left: 17,
        top: 24.013,
        width: 22.95,
        height: 18.924,
      }}>
        <path d={"M 5.411 6.8 L 22.525 6.8 L 22.95 6.8 L 22.95 4.136 C 22.95 3.496 22.429 2.975 21.789 2.975 L 11.269 2.975 L 9.144 0 L 1.161 0 C 0.521 0 0 0.521 0 1.161 L 0 18.924 L 4.37 7.57 C 4.487 7.131 4.919 6.8 5.411 6.8 Z"} fill="currentColor" fillRule="nonzero" />
      </svg>
    </div>
  );
}
export default FileIconsFolder;

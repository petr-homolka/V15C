// figma node: 12068:47 Forms / Checkbox / Active
export function FormsCheckboxActive(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 66,
      height: 20,
      position: "relative",
      color: "rgb(255,255,255)",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 20,
        height: 20,
        borderRadius: 4,
        backgroundColor: "rgb(94,129,244)",
      }} />
      <span style={{
        position: "absolute",
        left: 32,
        top: -1,
        width: 29,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(28,29,33)",
      }}>{props.text1 ?? "Title"}</span>
      <svg width={10.728} height={8} viewBox="0 0 10.728 8" fill="none" style={{
        position: "absolute",
        left: 5,
        top: 6,
        width: 10.728,
        height: 8,
      }}>
        <path d={"M 3.644 7.843 L 0.157 4.356 C -0.052 4.147 -0.052 3.807 0.157 3.598 L 0.916 2.839 C 1.125 2.63 1.465 2.63 1.674 2.839 L 4.023 5.188 L 9.054 0.157 C 9.263 -0.052 9.603 -0.052 9.812 0.157 L 10.571 0.916 C 10.78 1.125 10.78 1.465 10.571 1.674 L 4.402 7.843 C 4.193 8.052 3.853 8.052 3.644 7.843 L 3.644 7.843 Z"} fill="currentColor" fillRule="nonzero" />
      </svg>
    </div>
  );
}
export default FormsCheckboxActive;

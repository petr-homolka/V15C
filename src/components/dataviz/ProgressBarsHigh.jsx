// figma node: 12068:136 Progress Bars / High
export function ProgressBarsHigh(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 103,
      height: 6,
      position: "relative",
      color: "rgb(124,231,172)",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 103,
        height: 6,
        borderRadius: 3,
        backgroundColor: "rgb(245,245,250)",
      }} />
      <svg width={86} height={6} viewBox="0 0 86 6" fill="none" style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 86,
        height: 6,
        borderRadius: 3,
      }}>
        <path d={"M 0 3 C 0 1.343 1.343 0 3 0 L 83 0 C 84.657 0 86 1.343 86 3 C 86 4.657 84.657 6 83 6 L 3 6 C 1.343 6 0 4.657 0 3 Z"} fill="currentColor" fillRule="nonzero" />
      </svg>
    </div>
  );
}
export default ProgressBarsHigh;

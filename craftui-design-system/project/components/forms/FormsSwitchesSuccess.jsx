// figma node: 12068:24 Forms / Switches / Success
export function FormsSwitchesSuccess(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 40,
      height: 22,
      position: "relative",
      ...props.style,
    }}>
      <svg width={40} height={22} viewBox="0 0 40 22" fill="none" style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 40,
        height: 22,
        borderRadius: 12,
        color: "rgb(124,231,172)",
      }}>
        <path d={"M 0 11 C 0 4.925 4.925 0 11 0 L 29 0 C 35.075 0 40 4.925 40 11 C 40 17.075 35.075 22 29 22 L 11 22 C 4.925 22 0 17.075 0 11 Z"} fill="currentColor" fillRule="evenodd" />
      </svg>
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none" style={{
        position: "absolute",
        left: 20,
        top: 3,
        width: 16,
        height: 16,
        color: "rgb(255,255,255)",
      }}>
        <path d={"M 8 16 C 12.418 16 16 12.418 16 8 C 16 3.582 12.418 0 8 0 C 3.582 0 0 3.582 0 8 C 0 12.418 3.582 16 8 16 Z"} fill="currentColor" fillRule="evenodd" />
      </svg>
    </div>
  );
}
export default FormsSwitchesSuccess;

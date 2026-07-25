// figma node: 12070:2160 Counters / Graph / Mobile
export function CountersGraphMobile(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 124,
      height: 150,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 124,
        height: 150,
        borderRadius: 10,
        backgroundColor: "rgb(255,255,255)",
      }} />
      <span style={{
        position: "absolute",
        left: 30,
        top: 114,
        width: 64,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? "New tasks"}</span>
      <span style={{
        position: "absolute",
        left: 45,
        top: 84,
        width: 35,
        height: 32,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 20,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "32px",
        color: "rgb(28,29,33)",
      }}>{props.text2 ?? "345"}</span>
      <div style={{
        position: "absolute",
        left: 20,
        top: 21,
        width: 84.706,
        height: 60,
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 84.706,
          height: 60,
        }} />
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 84.70587921142578,
          height: 60,
          clipPath: "inset(0px 0px 0px 0px)",
        }}>
          <svg width={157.059} height={35.576} viewBox="0 0 157.059 35.576" fill="none" style={{
            position: "absolute",
            left: 0,
            top: 7.432,
            width: 157.059,
            height: 35.576,
            color: "rgb(94,129,244)",
          }}>
            <path d={"M 0.25 26.726 C 7.093 33.765 13.011 36.655 18.037 35.218 C 20.904 34.398 22.997 32.598 27.131 28.086 C 28.024 27.111 28.022 27.113 28.341 26.77 C 31.99 22.837 34.225 21.217 36.668 21.217 C 37.969 21.217 39 21.299 41.316 21.545 L 41.396 21.553 C 49.068 22.368 52.906 21.751 58.49 17.415 C 60.189 16.096 61.695 14.625 63.241 12.844 C 64.22 11.717 67.257 7.901 67.15 8.032 C 70.728 3.668 73.405 1.977 78.021 1.977 C 79.908 1.977 81.726 2.803 84.049 4.562 C 84.559 4.947 85.091 5.374 85.752 5.923 C 86.091 6.205 87.297 7.218 87.516 7.401 C 91.857 11.023 94.73 12.693 98.554 13.14 C 103.524 13.721 109.032 11.649 115.571 6.353 C 129.241 -4.718 142.409 4.464 155.365 34.717 C 155.557 35.165 156.076 35.372 156.524 35.18 C 156.972 34.989 157.179 34.47 156.988 34.022 C 143.641 2.859 129.369 -7.093 114.461 4.981 C 108.261 10.002 103.2 11.907 98.759 11.387 C 95.371 10.991 92.743 9.464 88.646 6.046 C 88.432 5.867 87.224 4.851 86.879 4.565 C 86.2 4.001 85.648 3.558 85.114 3.154 C 82.512 1.186 80.371 0.213 78.021 0.213 C 72.781 0.213 69.665 2.18 65.785 6.913 C 65.871 6.808 62.858 10.594 61.909 11.687 C 60.433 13.387 59.007 14.779 57.408 16.021 C 52.257 20.021 48.845 20.57 41.582 19.798 L 41.503 19.79 C 39.125 19.537 38.051 19.452 36.668 19.452 C 33.548 19.452 31.03 21.278 27.047 25.569 C 26.861 25.77 26.667 25.98 26.437 26.231 C 26.29 26.391 26.133 26.562 25.83 26.894 C 21.933 31.147 19.98 32.827 17.552 33.521 C 13.31 34.734 7.953 32.118 1.515 25.496 C 1.175 25.147 0.617 25.139 0.267 25.479 C -0.082 25.818 -0.09 26.377 0.25 26.726 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
          <svg width={14} height={14} viewBox="0 0 14 14" fill="none" style={{
            position: "absolute",
            left: 52.118,
            top: 15.941,
            width: 14,
            height: 14,
            color: "rgb(255,255,255)",
          }}>
            <path d={"M 7 14 C 10.866 14 14 10.866 14 7 C 14 3.134 10.866 0 7 0 C 3.134 0 0 3.134 0 7 C 0 10.866 3.134 14 7 14 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
          <svg width={8} height={8} viewBox="0 0 8 8" fill="none" style={{
            position: "absolute",
            left: 55.118,
            top: 18.941,
            width: 8,
            height: 8,
            color: "rgb(94,129,244)",
          }}>
            <path d={"M 4 8 C 6.209 8 8 6.209 8 4 C 8 1.791 6.209 0 4 0 C 1.791 0 0 1.791 0 4 C 0 6.209 1.791 8 4 8 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
        </div>
      </div>
    </div>
  );
}
export default CountersGraphMobile;

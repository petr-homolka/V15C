// figma node: 12070:2695 Graphs/Pie Sidebar with Counters
export function GraphsPieSidebarWithCounters(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 322,
      height: 322,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 322,
        height: 322,
        borderRadius: 12,
        backgroundColor: "rgba(245,245,250,0.4)",
      }} />
      <div style={{
        position: "absolute",
        left: 0,
        top: 246,
        width: 322,
        height: 75,
      }}>
        <svg width={1} height={321.575} viewBox="0 0 1 321.575" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: "matrix(0,-1,1,0,0.425,1.500)",
          transformOrigin: "0 0",
          width: 1,
          height: 321.575,
          color: "rgb(238,238,238)",
        }}>
          <path d={"M 0.5 -0.002 L 0.498 -0.502 L -0.502 -0.498 L -0.5 0.002 L 0 0 L 0.5 -0.002 Z M 0.5 321.577 L 0.502 322.077 L 1.502 322.074 L 1.5 321.574 L 1 321.575 L 0.5 321.577 Z M 0 0 L -0.5 0.002 L 0.5 321.577 L 1 321.575 L 1.5 321.574 L 0.5 -0.002 L 0 0 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <span style={{
          position: "absolute",
          left: 46,
          top: 18,
          width: 69,
          height: 24,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 16,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "24px",
          color: "rgb(28,29,33)",
        }}>{props.text1 ?? "$342.000"}</span>
        <span style={{
          position: "absolute",
          left: 207,
          top: 18,
          width: 69,
          height: 24,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 16,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "24px",
          color: "rgb(28,29,33)",
        }}>{props.text2 ?? "$200.000"}</span>
        <span style={{
          position: "absolute",
          left: 49,
          top: 38,
          width: 64,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "21px",
          color: "rgb(129,129,165)",
        }}>{props.text3 ?? "Total sales"}</span>
        <span style={{
          position: "absolute",
          left: 211,
          top: 38,
          width: 63,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "21px",
          color: "rgb(129,129,165)",
        }}>{props.text4 ?? "Spendings"}</span>
        <svg width={1} height={71.998} viewBox="0 0 1 71.998" fill="none" style={{
          position: "absolute",
          left: 160.076,
          top: 3,
          width: 1,
          height: 71.998,
          color: "rgb(238,238,238)",
        }}>
          <path d={"M 1 0 L 1 -0.5 L 0 -0.5 L 0 0 L 0.5 0 L 1 0 Z M 0 71.998 L 0 72.498 L 1 72.498 L 1 71.998 L 0.5 71.998 L 0 71.998 Z M 0.5 0 L 0 0 L 0 71.998 L 0.5 71.998 L 1 71.998 L 1 0 L 0.5 0 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
      </div>
      <div style={{
        position: "absolute",
        left: 59,
        top: 19,
        width: 204,
        height: 204,
      }}>
        <svg width={176} height={176} viewBox="0 0 176 176" fill="none" style={{
          position: "absolute",
          left: 14,
          top: 14,
          width: 176,
          height: 176,
          color: "rgb(238,238,238)",
        }}>
          <path d={"M 88 176 L 88 178 C 137.706 178 178 137.706 178 88 L 176 88 L 174 88 C 174 135.496 135.496 174 88 174 L 88 176 Z M 176 88 L 178 88 C 178 38.294 137.706 -2 88 -2 L 88 0 L 88 2 C 135.496 2 174 40.504 174 88 L 176 88 Z M 88 0 L 88 -2 C 38.294 -2 -2 38.294 -2 88 L 0 88 L 2 88 C 2 40.504 40.504 2 88 2 L 88 0 Z M 0 88 L -2 88 C -2 137.706 38.294 178 88 178 L 88 176 L 88 174 C 40.504 174 2 135.496 2 88 L 0 88 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <svg width={176} height={176} viewBox="0 0 176 176" fill="none" style={{
          position: "absolute",
          left: 14,
          top: 14,
          width: 176,
          height: 176,
          color: "rgb(94,129,244)",
        }}>
          <path d={"M 88 174 C 86.895 174 86 174.895 86 176 C 86 177.105 86.895 178 88 178 L 88 176 L 88 174 Z M -2 88 C -2 89.105 -1.105 90 0 90 C 1.105 90 2 89.105 2 88 L 0 88 L -2 88 Z M 88 176 L 88 178 C 137.706 178 178 137.706 178 88 L 176 88 L 174 88 C 174 135.496 135.496 174 88 174 L 88 176 Z M 176 88 L 178 88 C 178 38.294 137.706 -2 88 -2 L 88 0 L 88 2 C 135.496 2 174 40.504 174 88 L 176 88 Z M 88 0 L 88 -2 C 38.294 -2 -2 38.294 -2 88 L 0 88 L 2 88 C 2 40.504 40.504 2 88 2 L 88 0 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <svg width={148} height={148} viewBox="0 0 148 148" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: "matrix(0.866,-0.500,0.500,0.866,0.914,74.914)",
          transformOrigin: "0 0",
          width: 148,
          height: 148,
          color: "rgb(238,238,238)",
        }}>
          <path d={"M 74 148 L 74 150 C 115.974 150 150 115.974 150 74 L 148 74 L 146 74 C 146 113.765 113.765 146 74 146 L 74 148 Z M 148 74 L 150 74 C 150 32.026 115.974 -2 74 -2 L 74 0 L 74 2 C 113.765 2 146 34.235 146 74 L 148 74 Z M 74 0 L 74 -2 C 32.026 -2 -2 32.026 -2 74 L 0 74 L 2 74 C 2 34.235 34.235 2 74 2 L 74 0 Z M 0 74 L -2 74 C -2 115.974 32.026 150 74 150 L 74 148 L 74 146 C 34.235 146 2 113.765 2 74 L 0 74 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <svg width={148} height={148} viewBox="0 0 148 148" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: "matrix(0.866,-0.500,0.500,0.866,0.914,74.914)",
          transformOrigin: "0 0",
          width: 148,
          height: 148,
          color: "rgb(150,152,214)",
        }}>
          <path d={"M 74 146 C 72.895 146 72 146.895 72 148 C 72 149.105 72.895 150 74 150 L 74 148 L 74 146 Z M -2 74 C -2 75.105 -1.105 76 0 76 C 1.105 76 2 75.105 2 74 L 0 74 L -2 74 Z M 74 148 L 74 150 C 115.974 150 150 115.974 150 74 L 148 74 L 146 74 C 146 113.765 113.765 146 74 146 L 74 148 Z M 148 74 L 150 74 C 150 32.026 115.974 -2 74 -2 L 74 0 L 74 2 C 113.765 2 146 34.235 146 74 L 148 74 Z M 74 0 L 74 -2 C 32.026 -2 -2 32.026 -2 74 L 0 74 L 2 74 C 2 34.235 34.235 2 74 2 L 74 0 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <svg width={118.980} height={118.980} viewBox="0 0 118.980 118.980" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: "matrix(0.500,-0.866,0.866,0.500,21.225,124.265)",
          transformOrigin: "0 0",
          width: 118.98,
          height: 118.98,
          color: "rgb(238,238,238)",
        }}>
          <path d={"M 59.49 118.98 L 59.49 116.98 L 59.49 118.98 Z M 118.98 59.49 L 116.98 59.49 L 118.98 59.49 Z M 59.49 0 L 59.49 -2 L 59.49 0 Z M 59.49 118.98 L 59.49 120.98 C 93.45 120.98 120.98 93.45 120.98 59.49 L 118.98 59.49 L 116.98 59.49 C 116.98 91.241 91.241 116.98 59.49 116.98 L 59.49 118.98 Z M 118.98 59.49 L 120.98 59.49 C 120.98 25.53 93.45 -2 59.49 -2 L 59.49 0 L 59.49 2 C 91.241 2 116.98 27.739 116.98 59.49 L 118.98 59.49 Z M 59.49 0 L 59.49 -2 C 25.53 -2 -2 25.53 -2 59.49 L 0 59.49 L 2 59.49 C 2 27.739 27.739 2 59.49 2 L 59.49 0 Z M 0 59.49 L -2 59.49 C -2 93.45 25.53 120.98 59.49 120.98 L 59.49 118.98 L 59.49 116.98 C 27.739 116.98 2 91.241 2 59.49 L 0 59.49 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <svg width={118.980} height={118.980} viewBox="0 0 118.980 118.980" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: "matrix(0.500,-0.866,0.866,0.500,21.225,124.265)",
          transformOrigin: "0 0",
          width: 118.98,
          height: 118.98,
          color: "rgb(255,128,139)",
        }}>
          <path d={"M 59.49 116.98 C 58.386 116.98 57.49 117.876 57.49 118.98 C 57.49 120.085 58.386 120.98 59.49 120.98 L 59.49 118.98 L 59.49 116.98 Z M 118.98 59.49 L 116.98 59.49 L 118.98 59.49 Z M 59.49 0 L 59.49 -2 L 59.49 0 Z M -2 59.49 C -2 60.595 -1.105 61.49 0 61.49 C 1.105 61.49 2 60.595 2 59.49 L 0 59.49 L -2 59.49 Z M 59.49 118.98 L 59.49 120.98 C 93.45 120.98 120.98 93.45 120.98 59.49 L 118.98 59.49 L 116.98 59.49 C 116.98 91.241 91.241 116.98 59.49 116.98 L 59.49 118.98 Z M 118.98 59.49 L 120.98 59.49 C 120.98 25.53 93.45 -2 59.49 -2 L 59.49 0 L 59.49 2 C 91.241 2 116.98 27.739 116.98 59.49 L 118.98 59.49 Z M 59.49 0 L 59.49 -2 C 25.53 -2 -2 25.53 -2 59.49 L 0 59.49 L 2 59.49 C 2 27.739 27.739 2 59.49 2 L 59.49 0 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <span style={{
          position: "absolute",
          left: 72.5,
          top: 81,
          width: 60,
          height: 38,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 26,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "38px",
          color: "rgb(28,29,33)",
        }}>$85k</span>
      </div>
    </div>
  );
}
export default GraphsPieSidebarWithCounters;

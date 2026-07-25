// figma node: 12068:2272 Widgets/Graphs/Pie
export function WidgetsGraphsPie(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 555,
      height: 440,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 555,
        height: 440,
        borderRadius: 10,
        backgroundColor: "rgb(255,255,255)",
      }} />
      <div style={{
        position: "absolute",
        left: 27,
        top: 20.853,
        width: 503,
        height: 42,
      }}>
        <div style={{
          position: "absolute",
          left: 237,
          top: 0,
          width: 266,
          height: 41.706,
        }}>
          <div style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 62,
            height: 41.706,
          }}>
            <div style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 62,
              height: 41.706,
              borderRadius: 8,
              backgroundColor: "rgb(255,255,255)",
              boxShadow: "inset 0 0 0 1px rgb(236,236,242)",
            }} />
            <span style={{
              position: "absolute",
              left: 17.5,
              top: 11,
              width: 26,
              height: 21,
              fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              textAlign: "center",
              whiteSpace: "nowrap",
              lineHeight: "21px",
              color: "rgb(28,29,33)",
            }}>Day</span>
          </div>
          <div style={{
            position: "absolute",
            left: 226,
            top: 0.853,
            width: 40,
            height: 40,
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 40,
              height: 40,
              opacity: 0.1,
              borderRadius: 6,
              backgroundColor: "rgb(129,129,165)",
            }} />
            <span style={{
              position: "absolute",
              left: 11,
              top: 11,
              width: 18,
              height: 18,
              fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
              fontWeight: 400,
              fontSize: 18,
              textAlign: "center",
              whiteSpace: "nowrap",
              lineHeight: "100%",
              color: "rgb(129,129,165)",
            }}>{props.text1 ?? ""}</span>
          </div>
          <div style={{
            position: "absolute",
            left: 70,
            top: 0,
            width: 64,
            height: 41.706,
          }}>
            <span style={{
              position: "absolute",
              left: 12.432,
              top: 10,
              width: 38,
              height: 21,
              fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              textAlign: "center",
              whiteSpace: "nowrap",
              lineHeight: "21px",
              color: "rgb(129,129,165)",
            }}>Week</span>
          </div>
          <div style={{
            position: "absolute",
            left: 142,
            top: 0,
            width: 76,
            height: 41.706,
          }}>
            <span style={{
              position: "absolute",
              left: 16.514,
              top: 10,
              width: 43,
              height: 21,
              fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              textAlign: "center",
              whiteSpace: "nowrap",
              lineHeight: "21px",
              color: "rgb(129,129,165)",
            }}>Month</span>
          </div>
        </div>
        <span style={{
          position: "absolute",
          left: 0,
          top: 7.874,
          width: 159,
          height: 27,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          lineHeight: "27px",
          color: "rgb(28,29,33)",
        }}>{props.text2 ?? "Income Breakdown"}</span>
      </div>
      <div style={{
        position: "absolute",
        left: 140,
        top: 109.341,
        width: 278,
        height: 238,
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          left: 37,
          top: 0,
          width: 200.741,
          height: 200.741,
          overflow: "hidden",
        }}>
          <svg width={200.741} height={200.741} viewBox="0 0 200.741 200.741" fill="none" style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 200.741,
            height: 200.741,
            color: "rgb(138,241,185)",
          }}>
            <path d={"M 100.809 200.741 C 155.803 200.741 200.741 155.803 200.741 100.809 C 200.741 44.937 155.803 0 100.809 0 C 44.937 0 0 44.937 0 100.809 C 0 155.803 44.937 200.741 100.809 200.741 Z"} fill="currentColor" fillRule="evenodd" />
          </svg>
        </div>
        <svg width={119.771} height={151.944} viewBox="0 0 119.771 151.944" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: "matrix(0.545,0.839,-0.839,0.545,127.951,10.535)",
          transformOrigin: "0 0",
          width: 119.771,
          height: 151.944,
          color: "rgb(94,129,244)",
        }}>
          <path d={"M 62.261 0 C 71.984 20.788 81.006 37.145 81.006 37.145 L 119.771 143.545 C 119.083 143.834 118.392 144.117 117.697 144.392 C 105.37 149.267 91.944 151.944 77.896 151.944 C 47.356 151.944 19.756 139.29 0 118.914 L 77.941 42.652 L 62.261 0 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <svg width={135.436} height={196.536} viewBox="0 0 135.436 196.536" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: "matrix(0.545,0.839,-0.839,0.545,203.779,17.312)",
          transformOrigin: "0 0",
          width: 135.436,
          height: 196.536,
          color: "rgb(255,128,139)",
        }}>
          <path d={"M 35.032 0 C 90.483 0 135.436 45.331 135.436 101.249 C 135.435 145.126 107.757 182.482 69.048 196.536 L 35.108 101.339 L 0 6.335 C 10.907 2.239 22.71 0 35.032 0 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <svg width={125} height={202} viewBox="0 0 125 202" fill="none" style={{
          position: "absolute",
          left: 114,
          top: 0,
          width: 125,
          height: 202,
          color: "rgb(244,190,94)",
        }}>
          <path d={"M 24.499 0 C 79.807 0 125 45.22 125 101.441 C 125 156.781 79.807 202 24.499 202 C 16.045 202 7.84 200.975 0 199.047 L 24.499 101 L 22.927 0.013 C 23.45 0.005 23.974 0 24.499 0 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <span style={{
          position: "absolute",
          left: 38,
          top: 117,
          width: 28,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          lineHeight: "21px",
          color: "rgb(255,255,255)",
        }}>{props.text3 ?? "16%"}</span>
        <svg width={140} height={140} viewBox="0 0 140 140" fill="none" style={{
          position: "absolute",
          left: 68,
          top: 31,
          width: 140,
          height: 140,
          color: "rgb(255,255,255)",
        }}>
          <path d={"M 70 140 C 108.66 140 140 108.66 140 70 C 140 31.34 108.66 0 70 0 C 31.34 0 0 31.34 0 70 C 0 108.66 31.34 140 70 140 Z"} fill="currentColor" fillRule="evenodd" />
        </svg>
      </div>
      <span style={{
        position: "absolute",
        left: 241,
        top: 188,
        width: 74,
        height: 42,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 32,
        whiteSpace: "nowrap",
        lineHeight: "42px",
        color: "rgb(28,29,33)",
      }}>{props.text4 ?? "$85k"}</span>
      <div style={{
        position: "absolute",
        left: 26,
        top: 358,
        width: 226,
        height: 21.896,
      }}>
        <span style={{
          position: "absolute",
          left: 23,
          top: 0.448,
          width: 124,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "21px",
          color: "rgb(28,29,33)",
        }}>Marketing Channels</span>
        <span style={{
          position: "absolute",
          left: 182,
          top: 0.448,
          width: 44,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          lineHeight: "21px",
          color: "rgb(28,29,33)",
        }}>$22.0k</span>
        <div style={{
          position: "absolute",
          left: 0,
          top: 4.427,
          width: 12,
          height: 12,
          overflow: "hidden",
        }}>
          <svg width={12} height={12} viewBox="0 0 12 12" fill="none" style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 12,
            height: 12,
            color: "rgb(94,129,244)",
          }}>
            <path d={"M 6 12 C 9.314 12 12 9.314 12 6 C 12 2.686 9.314 0 6 0 C 2.686 0 0 2.686 0 6 C 0 9.314 2.686 12 6 12 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
          <svg width={4} height={4} viewBox="0 0 4 4" fill="none" style={{
            position: "absolute",
            left: 4,
            top: 4,
            width: 4,
            height: 4,
            color: "rgb(255,255,255)",
          }}>
            <path d={"M 2 4 C 3.105 4 4 3.105 4 2 C 4 0.895 3.105 0 2 0 C 0.895 0 0 0.895 0 2 C 0 3.105 0.895 4 2 4 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
        </div>
      </div>
      <div style={{
        position: "absolute",
        left: 26,
        top: 392,
        width: 226,
        height: 21.896,
      }}>
        <span style={{
          position: "absolute",
          left: 190,
          top: 0.448,
          width: 36,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          lineHeight: "21px",
          color: "rgb(28,29,33)",
        }}>$8.4k</span>
        <span style={{
          position: "absolute",
          left: 23,
          top: 0.448,
          width: 74,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "21px",
          color: "rgb(28,29,33)",
        }}>Direct Sales</span>
        <div style={{
          position: "absolute",
          left: 0,
          top: 5.469,
          width: 12,
          height: 12,
          overflow: "hidden",
        }}>
          <svg width={12} height={12} viewBox="0 0 12 12" fill="none" style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 12,
            height: 12,
            color: "rgb(124,231,172)",
          }}>
            <path d={"M 6 12 C 9.314 12 12 9.314 12 6 C 12 2.686 9.314 0 6 0 C 2.686 0 0 2.686 0 6 C 0 9.314 2.686 12 6 12 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
          <svg width={4} height={4} viewBox="0 0 4 4" fill="none" style={{
            position: "absolute",
            left: 4,
            top: 4,
            width: 4,
            height: 4,
            color: "rgb(255,255,255)",
          }}>
            <path d={"M 2 4 C 3.105 4 4 3.105 4 2 C 4 0.895 3.105 0 2 0 C 0.895 0 0 0.895 0 2 C 0 3.105 0.895 4 2 4 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
        </div>
      </div>
      <div style={{
        position: "absolute",
        left: 300,
        top: 358,
        width: 226,
        height: 21.896,
      }}>
        <span style={{
          position: "absolute",
          left: 182,
          top: 0.448,
          width: 44,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          lineHeight: "21px",
          color: "rgb(28,29,33)",
        }}>$18.6k</span>
        <span style={{
          position: "absolute",
          left: 23,
          top: 0.448,
          width: 103,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "21px",
          color: "rgb(28,29,33)",
        }}>Offline Channels</span>
        <div style={{
          position: "absolute",
          left: 0,
          top: 4.427,
          width: 12,
          height: 12,
          overflow: "hidden",
        }}>
          <svg width={12} height={12} viewBox="0 0 12 12" fill="none" style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 12,
            height: 12,
            color: "rgb(244,190,94)",
          }}>
            <path d={"M 6 12 C 9.314 12 12 9.314 12 6 C 12 2.686 9.314 0 6 0 C 2.686 0 0 2.686 0 6 C 0 9.314 2.686 12 6 12 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
          <svg width={4} height={4} viewBox="0 0 4 4" fill="none" style={{
            position: "absolute",
            left: 4,
            top: 4,
            width: 4,
            height: 4,
            color: "rgb(255,255,255)",
          }}>
            <path d={"M 2 4 C 3.105 4 4 3.105 4 2 C 4 0.895 3.105 0 2 0 C 0.895 0 0 0.895 0 2 C 0 3.105 0.895 4 2 4 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
        </div>
      </div>
      <div style={{
        position: "absolute",
        left: 300,
        top: 392,
        width: 226,
        height: 21.896,
      }}>
        <span style={{
          position: "absolute",
          left: 182,
          top: 0.448,
          width: 44,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          lineHeight: "21px",
          color: "rgb(28,29,33)",
        }}>$15.3k</span>
        <span style={{
          position: "absolute",
          left: 21,
          top: 0.448,
          width: 97,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "21px",
          color: "rgb(28,29,33)",
        }}>Other Channels</span>
        <div style={{
          position: "absolute",
          left: 0,
          top: 5.469,
          width: 12,
          height: 12,
          overflow: "hidden",
        }}>
          <svg width={12} height={12} viewBox="0 0 12 12" fill="none" style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 12,
            height: 12,
            color: "rgb(255,128,139)",
          }}>
            <path d={"M 6 12 C 9.314 12 12 9.314 12 6 C 12 2.686 9.314 0 6 0 C 2.686 0 0 2.686 0 6 C 0 9.314 2.686 12 6 12 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
          <svg width={4} height={4} viewBox="0 0 4 4" fill="none" style={{
            position: "absolute",
            left: 4,
            top: 4,
            width: 4,
            height: 4,
            color: "rgb(255,255,255)",
          }}>
            <path d={"M 2 4 C 3.105 4 4 3.105 4 2 C 4 0.895 3.105 0 2 0 C 0.895 0 0 0.895 0 2 C 0 3.105 0.895 4 2 4 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
        </div>
      </div>
    </div>
  );
}
export default WidgetsGraphsPie;

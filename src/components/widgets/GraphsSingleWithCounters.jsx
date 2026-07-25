// figma node: 12068:2230 Graphs/Single With Counters
export function GraphsSingleWithCounters(_p = {}) {
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
        top: 20,
        width: 503,
        height: 40,
      }}>
        <div style={{
          position: "absolute",
          left: 237,
          top: 0,
          width: 266,
          height: 40,
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 62,
            height: 40,
          }}>
            <div style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 62,
              height: 40,
              borderRadius: 8,
              backgroundColor: "rgb(255,255,255)",
              boxShadow: "inset 0 0 0 1px rgb(236,236,242)",
            }} />
            <span style={{
              position: "absolute",
              left: 17.5,
              top: 10,
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
            top: 0,
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
            height: 40,
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
            height: 40,
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
          top: 7,
          width: 121,
          height: 27,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          whiteSpace: "nowrap",
          lineHeight: "27px",
          color: "rgb(28,29,33)",
        }}>{props.text2 ?? "Income Details"}</span>
      </div>
      <div style={{
        position: "absolute",
        left: 0,
        top: 343.033,
        width: 555,
        height: 92,
      }}>
        <svg width={1} height={554} viewBox="0 0 1 554" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: "matrix(0,-1,1,0,0.500,2.064)",
          transformOrigin: "0 0",
          width: 1,
          height: 554,
          color: "rgb(236,236,242)",
        }}>
          <path d={"M 1 0 L 1 -0.5 L 0 -0.5 L 0 0 L 0.5 0 L 1 0 Z M 0 554 L 0 554.5 L 1 554.5 L 1 554 L 0.5 554 L 0 554 Z M 0.5 0 L 0 0 L 0 554 L 0.5 554 L 1 554 L 1 0 L 0.5 0 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <span style={{
          position: "absolute",
          left: 54,
          top: 25.078,
          width: 78,
          height: 27,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          textAlign: "center",
          lineHeight: "27px",
          color: "rgb(28,29,33)",
        }}>{props.text3 ?? "$342.000"}</span>
        <span style={{
          position: "absolute",
          left: 427,
          top: 25.078,
          width: 78,
          height: 27,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          textAlign: "center",
          lineHeight: "27px",
          color: "rgb(28,29,33)",
        }}>{props.text4 ?? "$142.000"}</span>
        <span style={{
          position: "absolute",
          left: 240,
          top: 25.078,
          width: 78,
          height: 27,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          textAlign: "center",
          lineHeight: "27px",
          color: "rgb(28,29,33)",
        }}>$200.000</span>
        <span style={{
          position: "absolute",
          left: 61,
          top: 49.974,
          width: 64,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "21px",
          color: "rgb(129,129,165)",
        }}>Total sales</span>
        <span style={{
          position: "absolute",
          left: 443,
          top: 47.5,
          width: 46,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "21px",
          color: "rgb(129,129,165)",
        }}>Income</span>
        <span style={{
          position: "absolute",
          left: 247,
          top: 47.5,
          width: 63,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "21px",
          color: "rgb(129,129,165)",
        }}>Spendings</span>
        <svg width={2} height={91} viewBox="0 0 2 91" fill="none" style={{
          position: "absolute",
          left: 370,
          top: 0.5,
          width: 2,
          height: 91,
          color: "rgb(236,236,242)",
        }}>
          <path d={"M 1.5 0 L 1.5 -0.5 L 0.5 -0.5 L 0.5 0 L 1 0 L 1.5 0 Z M 0.5 91 L 0.5 91.5 L 1.5 91.5 L 1.5 91 L 1 91 L 0.5 91 Z M 1 0 L 0.5 0 L 0.5 91 L 1 91 L 1.5 91 L 1.5 0 L 1 0 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <svg width={2} height={91} viewBox="0 0 2 91" fill="none" style={{
          position: "absolute",
          left: 185,
          top: 0.5,
          width: 2,
          height: 91,
          color: "rgb(236,236,242)",
        }}>
          <path d={"M 1.5 0 L 1.5 -0.5 L 0.5 -0.5 L 0.5 0 L 1 0 L 1.5 0 Z M 0.5 91 L 0.5 91.5 L 1.5 91.5 L 1.5 91 L 1 91 L 0.5 91 Z M 1 0 L 0.5 0 L 0.5 91 L 1 91 L 1.5 91 L 1.5 0 L 1 0 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
      </div>
      <div style={{
        position: "absolute",
        left: 1,
        top: 76.114,
        width: 553,
        height: 267.962,
        overflow: "hidden",
      }}>
        <svg width={553} height={267.962} viewBox="0 0 553 267.962" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 553,
          height: 267.962,
        }}>
          <path d={"M 0 0 L 553 0 L 553 267.962 L 0 267.962 L 0 0 Z"} fill="currentColor" fillRule="evenodd" />
        </svg>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 553,
          height: 267.96209716796875,
          clipPath: "inset(0px 0px 0px 0px)",
        }}>
          <svg width={1206} height={189.763} viewBox="0 0 1206 189.763" fill="none" style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: "matrix(-1,0,0,1,613,80.284)",
            transformOrigin: "0 0",
            width: 1206,
            height: 189.763,
            opacity: 0.15,
          }}>
            <path d={"M 0 71.364 C 0 71.364 34 99.108 52.132 87.918 C 70.264 76.728 75.784 41.023 125.392 41.023 C 174.999 41.023 242.636 111.401 281.442 111.401 C 320.248 111.401 360.626 43.744 418.453 77.347 C 476.28 110.95 465.501 132.641 511.421 132.641 C 557.341 132.641 597.315 -0.64 649.384 0.002 C 688.208 0.002 703.111 126.536 716.055 146.167 C 728.999 165.798 765.169 111.401 829.082 111.401 C 885.494 111.401 938.991 6.669 993.764 6.669 C 1048.537 6.669 1070.788 117.735 1119.381 117.735 C 1167.973 117.735 1167.255 77.347 1205.863 77.347 C 1206.137 146.826 1205.863 189.763 1205.863 189.763 L 0 189.763 L 0 71.364 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
          <svg width={1206} height={150.142} viewBox="0 0 1206 150.142" fill="none" style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: "matrix(-1,0,0,1,613,80.284)",
            transformOrigin: "0 0",
            width: 1206,
            height: 150.142,
            color: "rgb(138,241,185)",
          }}>
            <path d={"M 649.458 0.002 L 649.446 1.002 L 649.458 1.002 L 649.458 0.002 Z M 0 71.223 C -0.631 71.999 -0.631 71.999 -0.631 71.999 C -0.63 72 -0.63 72 -0.629 72.001 C -0.628 72.002 -0.626 72.003 -0.624 72.005 C -0.619 72.009 -0.613 72.014 -0.604 72.021 C -0.587 72.035 -0.561 72.056 -0.528 72.082 C -0.461 72.136 -0.362 72.215 -0.233 72.316 C 0.024 72.52 0.403 72.815 0.891 73.187 C 1.865 73.929 3.276 74.976 5.024 76.195 C 8.519 78.633 13.376 81.772 18.812 84.562 C 24.241 87.348 30.291 89.809 36.165 90.859 C 42.036 91.908 47.841 91.565 52.662 88.596 L 52.138 87.745 L 51.614 86.893 C 47.368 89.508 42.122 89.892 36.517 88.89 C 30.915 87.889 25.064 85.522 19.725 82.782 C 14.394 80.046 9.616 76.96 6.169 74.555 C 4.446 73.353 3.058 72.324 2.103 71.596 C 1.625 71.232 1.255 70.943 1.006 70.747 C 0.881 70.648 0.787 70.573 0.724 70.522 C 0.692 70.497 0.669 70.478 0.653 70.466 C 0.646 70.459 0.64 70.455 0.636 70.452 C 0.634 70.45 0.633 70.449 0.632 70.449 C 0.632 70.448 0.632 70.448 0.631 70.448 C 0.631 70.448 0.631 70.448 0 71.223 Z M 52.138 87.745 L 52.662 88.596 C 57.362 85.702 61.202 81.251 65.047 76.336 C 68.923 71.383 72.811 65.951 77.69 60.846 C 87.371 50.717 100.901 41.942 125.406 41.942 L 125.406 40.942 L 125.406 39.942 C 100.297 39.942 86.26 48.984 76.244 59.464 C 71.275 64.664 67.282 70.235 63.472 75.104 C 59.631 80.012 55.981 84.204 51.614 86.893 L 52.138 87.745 Z M 125.406 40.942 L 125.406 41.942 C 137.591 41.942 150.963 46.26 164.837 52.821 C 178.701 59.377 192.975 68.127 206.959 76.908 C 220.922 85.676 234.609 94.484 247.228 101.092 C 259.823 107.688 271.512 112.181 281.474 112.181 L 281.474 111.181 L 281.474 110.181 C 272.03 110.181 260.71 105.894 248.156 99.32 C 235.625 92.758 222.024 84.007 208.023 75.215 C 194.043 66.436 179.677 57.626 165.692 51.013 C 151.716 44.404 138.027 39.942 125.406 39.942 L 125.406 40.942 Z M 281.474 111.181 L 281.474 112.181 C 291.451 112.181 301.443 107.846 311.621 102.022 C 316.72 99.105 321.901 95.792 327.174 92.428 C 332.454 89.059 337.83 85.638 343.35 82.48 C 354.394 76.16 365.943 70.938 378.277 69.349 C 390.582 67.763 403.729 69.785 417.999 78.06 L 418.5 77.195 L 419.002 76.33 C 404.355 67.836 390.767 65.722 378.021 67.365 C 365.305 69.004 353.489 74.374 342.357 80.744 C 336.789 83.93 331.374 87.376 326.098 90.742 C 320.815 94.112 315.677 97.398 310.628 100.287 C 300.511 106.075 290.902 110.181 281.474 110.181 L 281.474 111.181 Z M 418.5 77.195 L 417.999 78.06 C 446.793 94.757 458.46 108.455 468.772 118.094 C 473.946 122.929 478.817 126.78 485.336 129.4 C 491.847 132.018 499.924 133.379 511.479 133.379 L 511.479 132.379 L 511.479 131.379 C 500.071 131.379 492.273 130.034 486.082 127.545 C 479.899 125.059 475.24 121.401 470.138 116.633 C 459.901 107.064 448.041 93.169 419.002 76.33 L 418.5 77.195 Z M 511.479 132.379 L 511.479 133.379 C 523.432 133.379 534.803 124.747 545.839 112.267 C 556.914 99.745 567.887 83.07 578.993 66.507 C 590.124 49.907 601.392 33.413 613.112 21.105 C 624.854 8.774 636.862 0.847 649.446 1.002 L 649.458 0.002 L 649.47 -0.998 C 636.016 -1.163 623.499 7.297 611.664 19.726 C 599.806 32.179 588.446 48.819 577.332 65.393 C 566.193 82.005 555.306 98.544 544.341 110.942 C 533.338 123.384 522.489 131.379 511.479 131.379 L 511.479 132.379 Z M 649.458 0.002 L 649.458 1.002 C 658.579 1.002 666.534 8.435 673.572 20.543 C 680.57 32.582 686.451 48.886 691.545 65.881 C 696.637 82.869 700.919 100.456 704.749 115.074 C 706.662 122.373 708.464 128.937 710.195 134.293 C 711.918 139.623 713.601 143.856 715.302 146.43 L 716.136 145.879 L 716.97 145.328 C 715.435 143.004 713.82 139.005 712.098 133.678 C 710.385 128.379 708.595 121.862 706.684 114.567 C 702.865 99.996 698.566 82.339 693.461 65.307 C 688.357 48.281 682.423 31.789 675.301 19.538 C 668.22 7.356 659.751 -0.998 649.458 -0.998 L 649.458 0.002 Z M 716.136 145.879 L 715.302 146.43 C 717.053 149.081 719.263 150.558 721.925 151 C 724.53 151.432 727.45 150.852 730.623 149.659 C 736.943 147.283 744.793 142.258 754.053 136.736 C 772.681 125.626 797.504 112.181 829.176 112.181 L 829.176 111.181 L 829.176 110.181 C 796.927 110.181 771.704 123.88 753.028 135.018 C 743.637 140.619 736.02 145.493 729.919 147.787 C 726.882 148.928 724.353 149.375 722.252 149.027 C 720.208 148.687 718.456 147.575 716.97 145.328 L 716.136 145.879 Z M 829.176 111.181 L 829.176 112.181 C 843.586 112.181 857.716 105.51 871.588 95.664 C 885.464 85.815 899.207 72.695 912.833 59.641 C 926.485 46.561 940.018 33.55 953.551 23.8 C 967.091 14.044 980.495 7.656 993.877 7.656 L 993.877 6.656 L 993.877 5.656 C 979.869 5.656 966.044 12.334 952.382 22.177 C 938.713 32.025 925.073 45.145 911.45 58.197 C 897.8 71.273 884.165 84.285 870.43 94.034 C 856.69 103.786 842.975 110.181 829.176 110.181 L 829.176 111.181 Z M 993.877 6.656 L 993.877 7.656 C 1007.203 7.656 1018.626 14.389 1029.081 24.688 C 1039.545 34.996 1048.926 48.765 1058.178 62.634 C 1067.402 76.462 1076.504 90.401 1086.35 100.868 C 1096.197 111.335 1106.947 118.502 1119.508 118.502 L 1119.508 117.502 L 1119.508 116.502 C 1107.769 116.502 1097.513 109.814 1087.807 99.498 C 1078.102 89.181 1069.104 75.409 1059.842 61.524 C 1050.609 47.683 1041.119 33.739 1030.485 23.264 C 1019.842 12.779 1007.941 5.656 993.877 5.656 L 993.877 6.656 Z M 1119.508 117.502 L 1119.508 118.502 C 1131.806 118.502 1141.031 115.95 1148.551 112.094 C 1156.055 108.247 1161.814 103.124 1167.183 98.077 C 1177.943 87.965 1187.143 78.195 1206 78.195 L 1206 77.195 L 1206 76.195 C 1186.244 76.195 1176.497 86.579 1165.814 96.62 C 1160.462 101.65 1154.875 106.604 1147.638 110.315 C 1140.418 114.017 1131.508 116.502 1119.508 116.502 L 1119.508 117.502 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
        </div>
      </div>
      <div style={{
        position: "absolute",
        left: 270,
        top: 224.171,
        width: 135,
        height: 119.905,
      }}>
        <svg width={104.787} height={1} viewBox="0 0 104.787 1" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: "matrix(0,-1,1,0,9.250,119.384)",
          transformOrigin: "0 0",
          width: 104.787,
          height: 1,
        }}>
          <path d={"M 0 0 L -0.5 0 L -0.5 1 L 0 1 L 0 0.5 L 0 0 Z M 104.787 1 L 105.287 1 L 105.287 0 L 104.787 0 L 104.787 0.5 L 104.787 1 Z M 2.015 1 L 2.515 1 L 2.515 0 L 2.015 0 L 2.015 0.5 L 2.015 1 Z M 6.045 0 L 5.545 0 L 5.545 1 L 6.045 1 L 6.045 0.5 L 6.045 0 Z M 10.076 1 L 10.576 1 L 10.576 0 L 10.076 0 L 10.076 0.5 L 10.076 1 Z M 14.106 0 L 13.606 0 L 13.606 1 L 14.106 1 L 14.106 0.5 L 14.106 0 Z M 18.136 1 L 18.636 1 L 18.636 0 L 18.136 0 L 18.136 0.5 L 18.136 1 Z M 22.166 0 L 21.666 0 L 21.666 1 L 22.166 1 L 22.166 0.5 L 22.166 0 Z M 26.197 1 L 26.697 1 L 26.697 0 L 26.197 0 L 26.197 0.5 L 26.197 1 Z M 30.227 0 L 29.727 0 L 29.727 1 L 30.227 1 L 30.227 0.5 L 30.227 0 Z M 34.257 1 L 34.757 1 L 34.757 0 L 34.257 0 L 34.257 0.5 L 34.257 1 Z M 38.287 0 L 37.787 0 L 37.787 1 L 38.287 1 L 38.287 0.5 L 38.287 0 Z M 42.318 1 L 42.818 1 L 42.818 0 L 42.318 0 L 42.318 0.5 L 42.318 1 Z M 46.348 0 L 45.848 0 L 45.848 1 L 46.348 1 L 46.348 0.5 L 46.348 0 Z M 50.378 1 L 50.878 1 L 50.878 0 L 50.378 0 L 50.378 0.5 L 50.378 1 Z M 54.408 0 L 53.908 0 L 53.908 1 L 54.408 1 L 54.408 0.5 L 54.408 0 Z M 58.439 1 L 58.939 1 L 58.939 0 L 58.439 0 L 58.439 0.5 L 58.439 1 Z M 62.469 0 L 61.969 0 L 61.969 1 L 62.469 1 L 62.469 0.5 L 62.469 0 Z M 66.499 1 L 66.999 1 L 66.999 0 L 66.499 0 L 66.499 0.5 L 66.499 1 Z M 70.53 0 L 70.03 0 L 70.03 1 L 70.53 1 L 70.53 0.5 L 70.53 0 Z M 74.56 1 L 75.06 1 L 75.06 0 L 74.56 0 L 74.56 0.5 L 74.56 1 Z M 78.59 0 L 78.09 0 L 78.09 1 L 78.59 1 L 78.59 0.5 L 78.59 0 Z M 82.62 1 L 83.12 1 L 83.12 0 L 82.62 0 L 82.62 0.5 L 82.62 1 Z M 86.651 0 L 86.151 0 L 86.151 1 L 86.651 1 L 86.651 0.5 L 86.651 0 Z M 90.681 1 L 91.181 1 L 91.181 0 L 90.681 0 L 90.681 0.5 L 90.681 1 Z M 94.711 0 L 94.211 0 L 94.211 1 L 94.711 1 L 94.711 0.5 L 94.711 0 Z M 98.741 1 L 99.241 1 L 99.241 0 L 98.741 0 L 98.741 0.5 L 98.741 1 Z M 102.772 0 L 102.272 0 L 102.272 1 L 102.772 1 L 102.772 0.5 L 102.772 0 Z M 0 0.5 L 0 1 L 2.015 1 L 2.015 0.5 L 2.015 0 L 0 0 L 0 0.5 Z M 6.045 0.5 L 6.045 1 L 10.076 1 L 10.076 0.5 L 10.076 0 L 6.045 0 L 6.045 0.5 Z M 14.106 0.5 L 14.106 1 L 18.136 1 L 18.136 0.5 L 18.136 0 L 14.106 0 L 14.106 0.5 Z M 22.166 0.5 L 22.166 1 L 26.197 1 L 26.197 0.5 L 26.197 0 L 22.166 0 L 22.166 0.5 Z M 30.227 0.5 L 30.227 1 L 34.257 1 L 34.257 0.5 L 34.257 0 L 30.227 0 L 30.227 0.5 Z M 38.287 0.5 L 38.287 1 L 42.318 1 L 42.318 0.5 L 42.318 0 L 38.287 0 L 38.287 0.5 Z M 46.348 0.5 L 46.348 1 L 50.378 1 L 50.378 0.5 L 50.378 0 L 46.348 0 L 46.348 0.5 Z M 54.408 0.5 L 54.408 1 L 58.439 1 L 58.439 0.5 L 58.439 0 L 54.408 0 L 54.408 0.5 Z M 62.469 0.5 L 62.469 1 L 66.499 1 L 66.499 0.5 L 66.499 0 L 62.469 0 L 62.469 0.5 Z M 70.53 0.5 L 70.53 1 L 74.56 1 L 74.56 0.5 L 74.56 0 L 70.53 0 L 70.53 0.5 Z M 78.59 0.5 L 78.59 1 L 82.62 1 L 82.62 0.5 L 82.62 0 L 78.59 0 L 78.59 0.5 Z M 86.651 0.5 L 86.651 1 L 90.681 1 L 90.681 0.5 L 90.681 0 L 86.651 0 L 86.651 0.5 Z M 94.711 0.5 L 94.711 1 L 98.741 1 L 98.741 0.5 L 98.741 0 L 94.711 0 L 94.711 0.5 Z M 102.772 0.5 L 102.772 1 L 104.787 1 L 104.787 0.5 L 104.787 0 L 102.772 0 L 102.772 0.5 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <div style={{
          position: "absolute",
          left: 0.5,
          top: 10.427,
          width: 18,
          height: 18.768,
          overflow: "hidden",
        }}>
          <svg width={18} height={18.768} viewBox="0 0 18 18.768" fill="none" style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 18,
            height: 18.768,
            filter: "drop-shadow(0px 2px 6px rgba(0,0,0,0.1271))",
            color: "rgb(255,255,255)",
          }}>
            <path d={"M 9 18.768 C 13.971 18.768 18 14.566 18 9.384 C 18 4.201 13.971 0 9 0 C 4.029 0 0 4.201 0 9.384 C 0 14.566 4.029 18.768 9 18.768 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
          <svg width={18} height={18.768} viewBox="0 0 18 18.768" fill="none" style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 18,
            height: 18.768,
            opacity: 0.545,
            color: "rgb(138,241,185)",
          }}>
            <path d={"M 9 18.768 C 13.971 18.768 18 14.566 18 9.384 C 18 4.201 13.971 0 9 0 C 4.029 0 0 4.201 0 9.384 C 0 14.566 4.029 18.768 9 18.768 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
          <svg width={10} height={10.427} viewBox="0 0 10 10.427" fill="none" style={{
            position: "absolute",
            left: 4,
            top: 4.171,
            width: 10,
            height: 10.427,
            color: "rgb(138,241,185)",
          }}>
            <path d={"M 5 10.427 C 7.761 10.427 10 8.092 10 5.213 C 10 2.334 7.761 0 5 0 C 2.239 0 0 2.334 0 5.213 C 0 8.092 2.239 10.427 5 10.427 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
        </div>
        <svg width={113.514} height={62.560} viewBox="0 0 113.514 62.560" fill="none" style={{
          position: "absolute",
          left: 20.986,
          top: 0,
          width: 113.514,
          height: 62.56,
          filter: "drop-shadow(0px 15px 35px rgba(152,169,188,0.2))",
          color: "rgb(255,255,255)",
        }}>
          <path d={"M 111.514 0 C 112.618 0 113.514 0.895 113.514 2 L 113.514 60.56 C 113.513 61.664 112.618 62.56 111.514 62.56 L 8.514 62.56 C 7.409 62.56 6.514 61.664 6.514 60.56 L 6.514 27.004 L 0.278 20.503 C -0.093 20.116 -0.093 19.505 0.278 19.118 L 6.514 12.616 L 6.514 2 C 6.514 0.895 7.409 0 8.514 0 L 111.514 0 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <span style={{
          position: "absolute",
          left: 44.5,
          top: 7.746,
          width: 40,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "21px",
          color: "rgb(129,129,165)",
        }}>March</span>
        <span style={{
          position: "absolute",
          left: 44.5,
          top: 30.685,
          width: 53,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          lineHeight: "21px",
          color: "rgb(28,29,33)",
        }}>$48.200</span>
      </div>
      <div style={{
        position: "absolute",
        left: 28,
        top: 93.839,
        width: 137,
        height: 56,
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0.811,
          display: "flex",
          flexDirection: "row",
          gap: 4,
          alignItems: "center",
          flexWrap: "nowrap",
        }}>
          <span style={{
            position: "relative",
            width: 112,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 26,
            lineHeight: "38px",
            color: "rgb(28,29,33)",
            flexShrink: 0,
          }}>$142.000</span>
          <span style={{
            position: "relative",
            width: 22,
            fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 400,
            fontSize: 22,
            textAlign: "center",
            lineHeight: "100%",
            color: "rgb(124,231,172)",
            flexShrink: 0,
          }}></span>
        </div>
        <span style={{
          position: "absolute",
          left: 0,
          top: 35,
          width: 78,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "21px",
          color: "rgb(129,129,165)",
        }}>Total income</span>
      </div>
    </div>
  );
}
export default GraphsSingleWithCounters;

/**
 * Clean monoline SVG icon components for the Services (/pricing) specification
 * section. Every icon preserves the exact geometry and viewBox from `frontend/svg/`,
 * verified to have no internal url(#...) defs/clipPath/mask/gradient dependencies,
 * with hardcoded `#6B8E5A` normalized to `currentColor` on the matching stroke/fill.
 */

export interface ServiceIconProps {
  size?: number;
  className?: string;
}

/** Source: `frontend/svg/clock-svgrepo-com.svg` (24x24, stroke) */
export function ClockIcon({ size = 20, className }: ServiceIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M12 7V12L14.5 13.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Source: `frontend/svg/clock-seven-svgrepo-com.svg` (24x24, stroke — 7 o'clock / 19:00) */
export function ClockEveningIcon({ size = 20, className }: ServiceIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M12 7V12L10.5 14.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Source: `frontend/svg/sparkle-bold-svgrepo-com.svg` (256x256, monoline outline fill) */
export function SparkleIcon({ size = 20, className }: ServiceIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M199.77344,125.2334,149.3457,106.6543,130.7666,56.22656a19.9996,19.9996,0,0,0-37.5332,0L74.6543,106.6543,24.22656,125.2334a19.9996,19.9996,0,0,0,0,37.5332L74.6543,181.3457l18.5791,50.42774a19.9996,19.9996,0,0,0,37.5332,0l18.5791-50.42774,50.42774-18.5791a19.9996,19.9996,0,0,0,0-37.5332Zm-60.45606,34.22949a19.97179,19.97179,0,0,0-11.85449,11.85449l.001-.001L112,213.28906,96.53711,171.31738a19.96863,19.96863,0,0,0-11.85352-11.85351L42.71094,144l41.97168-15.46289a19.96863,19.96863,0,0,0,11.85351-11.85352L112,74.71094l15.46289,41.97168a19.96863,19.96863,0,0,0,11.85352,11.85351L181.28906,144ZM140,40a12.0006,12.0006,0,0,1,12-12h12V16a12,12,0,0,1,24,0V28h12a12,12,0,0,1,0,24H188V64a12,12,0,0,1-24,0V52H152A12.0006,12.0006,0,0,1,140,40ZM252,88a12.0006,12.0006,0,0,1-12,12h-4v4a12,12,0,0,1-24,0v-4h-4a12,12,0,0,1,0-24h4V72a12,12,0,0,1,24,0v4h4A12.0006,12.0006,0,0,1,252,88Z" />
    </svg>
  );
}

/** Source: `frontend/svg/photograph-photography-svgrepo-com.svg` (512x512, studio lamp on stand) */
export function StudioLightIcon({ size = 20, className }: ServiceIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M446.182,482.911L323.038,371.767V190.23h51.989c9.22,0,16.696-7.475,16.696-16.696V67.84 c0-9.22-7.475-16.696-16.696-16.696H271.607C249.13,19.381,212.192,0,172.988,0c-9.22,0-16.696,7.475-16.696,16.696v207.982 c0,9.22,7.475,16.696,16.696,16.696c39.205,0,76.144-19.381,98.619-51.143h18.04v181.543L166.511,482.909 c-6.845,6.178-7.386,16.736-1.209,23.581c6.183,6.85,16.74,7.383,23.581,1.209l56.621-51.102l44.144,17.538v21.169 c0,9.22,7.475,16.696,16.696,16.696c9.22,0,16.696-7.475,16.696-16.696v-21.168l44.152-17.542l56.619,51.102 c6.844,6.18,17.401,5.635,23.581-1.208C453.568,499.645,453.029,489.088,446.182,482.911z M189.684,206.352V35.023 C283.826,53.56,283.638,187.852,189.684,206.352z M289.647,438.204l-16.502-6.556l16.502-14.894V438.204z M288.15,156.839 c7.209-22.939,7.484-48.335,0-72.303h70.183v72.303H288.15z M323.038,438.206v-21.461l16.51,14.901L323.038,438.206z" />
      <path d="M112.871,137.383c9.22,0,16.696-7.475,16.696-16.696s-7.475-16.696-16.696-16.696H77.004 c-9.22,0-16.696,7.475-16.696,16.696s7.475,16.696,16.696,16.696H112.871z" />
      <path d="M101.065,75.1c6.52,6.52,17.091,6.52,23.611,0c6.52-6.519,6.52-17.091,0-23.611L99.313,26.126 c-6.519-6.519-17.091-6.519-23.611,0c-6.52,6.519-6.52,17.091,0,23.611L101.065,75.1z" />
      <path d="M101.066,166.274l-25.363,25.364c-6.52,6.52-6.52,17.091,0,23.611c6.518,6.52,17.09,6.521,23.611,0l25.363-25.364 c6.52-6.52,6.52-17.091,0-23.611C118.157,159.752,107.586,159.754,101.066,166.274z" />
    </svg>
  );
}

/** Source: `frontend/svg/files-svgrepo-com.svg` (192x192, monoline folder fill) */
export function FilesFolderIcon({ size = 20, className }: ServiceIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 192 192"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        fill="currentColor"
        d="m80 38 4.243-4.243A6 6 0 0 0 80 32v6Zm16 16-4.243 4.243A6 6 0 0 0 96 60v-6Zm58 94H38v12h116v-12ZM28 138V54H16v84h12Zm10-94h42V32H38v12Zm37.757-1.757 16 16 8.486-8.486-16-16-8.486 8.486ZM164 70v68h12V70h-12ZM96 60h58V48H96v12Zm-58 88c-5.523 0-10-4.477-10-10H16c0 12.15 9.85 22 22 22v-12Zm116 12c12.15 0 22-9.85 22-22h-12c0 5.523-4.477 10-10 10v12Zm22-90c0-12.15-9.85-22-22-22v12c5.523 0 10 4.477 10 10h12ZM28 54c0-5.523 4.477-10 10-10V32c-12.15 0-22 9.85-22 22h12Z"
      />
    </svg>
  );
}

/** Source: `frontend/svg/photo-svgrepo-com.svg` (24x24, stroke) */
export function PhotoFrameIcon({ size = 20, className }: ServiceIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M3 8.976C3 4.05476 4.05476 3 8.976 3H15.024C19.9452 3 21 4.05476 21 8.976V15.024C21 19.9452 19.9452 21 15.024 21H8.976C4.05476 21 3 19.9452 3 15.024V8.976Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M17.0045 16.5022L12.7279 12.2256C9.24808 8.74578 7.75642 8.74578 4.27658 12.2256L3 13.5022"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M21 13.6702C18.9068 12.0667 17.4778 12.2919 15.198 14.3459"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M17 8C17 8.55228 16.5523 9 16 9C15.4477 9 15 8.55228 15 8C15 7.44772 15.4477 7 16 7C16.5523 7 17 7.44772 17 8Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

/** Source: `frontend/svg/profile-1341-svgrepo-com.svg` (20x20, translated path fill) */
export function StaffProfileIcon({ size = 20, className }: ServiceIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g
        transform="translate(-180 -2159)"
        fill="currentColor"
        fillRule="evenodd"
      >
        <g transform="translate(56 160)">
          <path d="M134,2008.99998 C131.783496,2008.99998 129.980955,2007.20598 129.980955,2004.99998 C129.980955,2002.79398 131.783496,2000.99998 134,2000.99998 C136.216504,2000.99998 138.019045,2002.79398 138.019045,2004.99998 C138.019045,2007.20598 136.216504,2008.99998 134,2008.99998 M137.775893,2009.67298 C139.370449,2008.39598 140.299854,2006.33098 139.958235,2004.06998 C139.561354,2001.44698 137.368965,1999.34798 134.722423,1999.04198 C131.070116,1998.61898 127.971432,2001.44898 127.971432,2004.99998 C127.971432,2006.88998 128.851603,2008.57398 130.224107,2009.67298 C126.852128,2010.93398 124.390463,2013.89498 124.004634,2017.89098 C123.948368,2018.48198 124.411563,2018.99998 125.008391,2018.99998 C125.519814,2018.99998 125.955881,2018.61598 126.001095,2018.10898 C126.404004,2013.64598 129.837274,2010.99998 134,2010.99998 C138.162726,2010.99998 141.595996,2013.64598 141.998905,2018.10898 C142.044119,2018.61598 142.480186,2018.99998 142.991609,2018.99998 C143.588437,2018.99998 144.051632,2018.48198 143.995366,2017.89098 C143.609537,2013.89498 141.147872,2010.93398 137.775893,2009.67298" />
        </g>
      </g>
    </svg>
  );
}

/** Source: `frontend/svg/film-svgrepo-com.svg` (24x24, stroke) */
export function FilmStripIcon({ size = 20, className }: ServiceIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M7 5V19M17 5V19M3 8H7M17 8H21M3 16H7M17 16H21M3 12H21M6.2 20H17.8C18.9201 20 19.4802 20 19.908 19.782C20.2843 19.5903 20.5903 19.2843 20.782 18.908C21 18.4802 21 17.9201 21 16.8V7.2C21 6.0799 21 5.51984 20.782 5.09202C20.5903 4.71569 20.2843 4.40973 19.908 4.21799C19.4802 4 18.9201 4 17.8 4H6.2C5.0799 4 4.51984 4 4.09202 4.21799C3.71569 4.40973 3.40973 4.71569 3.21799 5.09202C3 5.51984 3 6.07989 3 7.2V16.8C3 17.9201 3 18.4802 3.21799 18.908C3.40973 19.2843 3.71569 19.5903 4.09202 19.782C4.51984 20 5.07989 20 6.2 20Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Source: `frontend/svg/country-direction-location-map-navigation-pin-svgrepo-com.svg` (28x28, evenodd fill) */
export function MapPinRouteIcon({ size = 20, className }: ServiceIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        clipRule="evenodd"
        fillRule="evenodd"
        fill="currentColor"
        d="M10 7.88974C11.1046 7.88974 12 6.98912 12 5.87814C12 4.76716 11.1046 3.86654 10 3.86654C8.89543 3.86654 8 4.76716 8 5.87814C8 6.98912 8.89543 7.88974 10 7.88974ZM10 6.5822C10.3866 6.5822 10.7 6.26698 10.7 5.87814C10.7 5.4893 10.3866 5.17408 10 5.17408C9.6134 5.17408 9.3 5.4893 9.3 5.87814C9.3 6.26698 9.6134 6.5822 10 6.5822Z"
      />
      <path
        clipRule="evenodd"
        fillRule="evenodd"
        fill="currentColor"
        d="M5.15 5.62669C5.15 3.0203 7.37393 1 10 1C12.6261 1 14.85 3.0203 14.85 5.62669C14.85 6.06012 14.8114 6.53528 14.7269 7.03578L18 7.8588L25.7575 5.90818C26.0562 5.83306 26.3727 5.90057 26.6154 6.09117C26.8581 6.28178 27 6.57423 27 6.88395V23.9826C27 24.4441 26.6877 24.8464 26.2425 24.9584L18.2425 26.97C18.0833 27.01 17.9167 27.01 17.7575 26.97L10 25.0193L2.24254 26.97C1.94379 27.0451 1.6273 26.9776 1.38459 26.787C1.14187 26.5964 1 26.3039 1 25.9942V8.89555C1 8.43402 1.3123 8.03172 1.75746 7.91978L5.2731 7.03578C5.18863 6.53528 5.15 6.06012 5.15 5.62669ZM10 2.70986C8.20779 2.70986 6.85 4.06691 6.85 5.62669C6.85 7.21686 7.5125 9.57287 9.40979 11.3615C9.74241 11.6751 10.2576 11.6751 10.5902 11.3615C12.4875 9.57287 13.15 7.21686 13.15 5.62669C13.15 4.06691 11.7922 2.70986 10 2.70986ZM5.80904 8.97453L3.22684 9.62382C3.09349 9.65735 3 9.77726 3 9.91476V24.3212C3 24.5165 3.18371 24.6598 3.37316 24.6121L8.77316 23.2543C8.90651 23.2208 9 23.1009 9 22.9634V13.2506C7.40353 12.024 6.39235 10.4792 5.80904 8.97453ZM11 13.2506V22.9634C11 23.1009 11.0935 23.2208 11.2268 23.2543L16.6268 24.6121C16.8163 24.6598 17 24.5165 17 24.3212V9.91477C17 9.77726 16.9065 9.65735 16.7732 9.62382L14.191 8.97453C13.6076 10.4792 12.5965 12.024 11 13.2506ZM25 22.9634C25 23.1009 24.9065 23.2208 24.7732 23.2543L19.3732 24.6121C19.1837 24.6598 19 24.5165 19 24.3212V9.91477C19 9.77726 19.0935 9.65736 19.2268 9.62382L24.6268 8.26599C24.8163 8.21835 25 8.36159 25 8.55693V22.9634Z"
      />
    </svg>
  );
}

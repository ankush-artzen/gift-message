import type { SVGProps } from "react";

export function NoteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        d="M6 3.5A1.5 1.5 0 0 0 4.5 5v7.25A1.5 1.5 0 0 0 6 13.75h1.75V16a.75.75 0 0 0 1.2.6l2.7-2.02.1-.08H14A1.5 1.5 0 0 0 15.5 13V5A1.5 1.5 0 0 0 14 3.5H6Zm1.25 3.25a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5h-5.5Zm0 3a.75.75 0 0 0 0 1.5H10a.75.75 0 0 0 0-1.5H7.25Z"
      />
    </svg>
  );
}

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        d="M10 2.25 4.5 4.4v4.85c0 3.55 2.2 6.35 5.5 7.5 3.3-1.15 5.5-3.95 5.5-7.5V4.4L10 2.25Zm2.28 5.53-2.75 3a.75.75 0 0 1-1.1.03L7.2 9.5a.75.75 0 1 1 1.1-1.02l.68.73 2.2-2.4a.75.75 0 1 1 1.1 1.02Z"
      />
    </svg>
  );
}

export function OrderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        d="M7.25 2.5A1.75 1.75 0 0 0 5.5 4.25v.5h-.75A1.75 1.75 0 0 0 3 6.5v9.25c0 .966.784 1.75 1.75 1.75h10.5A1.75 1.75 0 0 0 17 15.75V6.5a1.75 1.75 0 0 0-1.75-1.75H14.5v-.5A1.75 1.75 0 0 0 12.75 2.5h-5.5Zm0 1.5h5.5a.25.25 0 0 1 .25.25v.5h-6v-.5a.25.25 0 0 1 .25-.25ZM6.75 9.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z"
      />
    </svg>
  );
}

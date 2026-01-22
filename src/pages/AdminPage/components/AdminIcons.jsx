export const CopyIcon = ({ title }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" role="img" focusable="false">
    {title && <title>{title}</title>}
    <path
      d="M9 9.5a2.5 2.5 0 0 1 2.5-2.5h6A2.5 2.5 0 0 1 20 9.5v7a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 9 16.5v-7zm-5 5A2.5 2.5 0 0 0 6.5 17h1.25a.75.75 0 0 1 0 1.5H6.5A4 4 0 0 1 2.5 14.5v-7A4 4 0 0 1 6.5 3.5h6A4 4 0 0 1 16.5 7.5v1.25a.75.75 0 0 1-1.5 0V7.5A2.5 2.5 0 0 0 12.5 5h-6A2.5 2.5 0 0 0 4 7.5v7z"
      fill="currentColor"
    />
  </svg>
);

export const CheckIcon = ({ title }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" role="img" focusable="false">
    {title && <title>{title}</title>}
    <path
      d="M9.55 16.2 5.8 12.45a.75.75 0 1 1 1.06-1.06l2.69 2.69 6.7-6.7a.75.75 0 1 1 1.06 1.06l-7.76 7.76z"
      fill="currentColor"
    />
  </svg>
);

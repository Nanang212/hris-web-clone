export default function IconHris(props: Readonly<React.SVGProps<SVGSVGElement>>) {
  return (
    <svg
      width='42'
      height='42'
      viewBox='0 0 42 42'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <rect width='42' height='42' rx='12' fill='#4F5EFF' />
      <path
        d='M21 11L13 15.5V24.5L21 31L29 24.5V15.5L21 11Z'
        stroke='white'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M18 17.5H24V24.5H18V17.5Z'
        stroke='white'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M21 17.5V24.5'
        stroke='white'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

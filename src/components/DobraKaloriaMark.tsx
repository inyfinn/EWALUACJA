import logo from '../assets/dobra-kaloria-logo.png';

export function DobraKaloriaMark({ className = 'h-12 w-auto' }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="Dobra Kaloria"
      className={`${className} shrink-0 object-contain`}
    />
  );
}

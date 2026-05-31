export default function MainHeading({ children, subtitle }) {
  return (
    <header className="theme-border mb-10 border-b pb-8">
      <h1 className="text-[2em] font-bold tracking-tight sm:text-[2.25em]">
        {children}
      </h1>
      {subtitle ? (
        <p className="theme-muted mt-3 text-[1.125em]">{subtitle}</p>
      ) : null}
    </header>
  );
}

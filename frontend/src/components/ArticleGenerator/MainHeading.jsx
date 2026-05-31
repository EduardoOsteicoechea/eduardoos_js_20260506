export default function MainHeading({ children, subtitle }) {
  return (
    <header className="mb-10 border-b border-slate-200 pb-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {children}
      </h1>
      {subtitle ? (
        <p className="mt-3 text-lg text-slate-600">{subtitle}</p>
      ) : null}
    </header>
  );
}

export default function MainHeading({ children, subtitle }) {
  return (
    <header className="article-main-heading theme-border">
      <h1 className="article-main-heading__title">
        {children}
      </h1>
      {subtitle ? (
        <p className="article-main-heading__subtitle theme-muted">{subtitle}</p>
      ) : null}
    </header>
  );
}

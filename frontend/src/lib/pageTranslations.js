/** @typedef {import('./siteLanguage').SiteLanguageId} SiteLanguageId */

/** @type {Record<string, Record<SiteLanguageId, string>>} */
export const PAGE_TRANSLATIONS = {
  homeTitle: {
    en: 'BIM Software Development and Consulting',
    es: 'Desarrollo de software BIM y consultoría',
  },
  homeIntro: {
    en: "I'm an AI enthusiast Licensed Architect, BIM Modeler and Full Stack BIM Software Developer with a multidisciplinary background spanning Design, Architecture, Art, Technology, Software Engineering, AI integrations and Cloud-Based Solutions.",
    es: 'Soy arquitecto colegiado, modelador BIM y desarrollador full stack de software BIM, entusiasta de la IA, con formación multidisciplinaria en diseño, arquitectura, arte, tecnología, ingeniería de software, integraciones de IA y soluciones en la nube.',
  },
  homeOutro: {
    en: 'I feel comfortable working in interdisciplinary, intercultural, inter-generational and inclusive remote and on-site teams.',
    es: 'Me siento cómodo trabajando en equipos interdisciplinarios, interculturales, intergeneracionales e inclusivos, tanto remotos como presenciales.',
  },
  homeSkillsHeading: {
    en: 'My skills include',
    es: 'Mis habilidades incluyen',
  },
};

/** @type {Record<string, Record<SiteLanguageId, string>>} */
export const SKILL_TITLE_TRANSLATIONS = {
  'problem-solving': {
    en: 'Interdisciplinary Problem Solving',
    es: 'Resolución interdisciplinaria de problemas',
  },
  'ai-driven-dev': {
    en: 'AI Driven Development',
    es: 'Desarrollo impulsado por IA',
  },
  'ai-integration': {
    en: 'AI Integrations',
    es: 'Integraciones de IA',
  },
  'web-dev': { en: 'Web Development', es: 'Desarrollo web' },
  'desktop-dev': { en: 'Desktop Development', es: 'Desarrollo de escritorio' },
  'cloud-dev': { en: 'Cloud Development', es: 'Desarrollo en la nube' },
  architecture: { en: 'Architecture', es: 'Arquitectura' },
  bim: { en: 'BIM', es: 'BIM' },
  'revit-api': { en: 'Revit API', es: 'API de Revit' },
  'dynamo-scripting': { en: 'Dynamo Scripting', es: 'Scripts en Dynamo' },
  'dynamo-nodes': {
    en: 'Dynamo Nodes Development',
    es: 'Desarrollo de nodos en Dynamo',
  },
  'autocad-api': { en: 'AutoCAD API', es: 'API de AutoCAD' },
  python: { en: 'Python', es: 'Python' },
  'csharp-dotnet': { en: 'C# .NET', es: 'C# .NET' },
  collaboration: { en: 'Inclusive Collaboration', es: 'Colaboración inclusiva' },
  writing: { en: 'Writing', es: 'Redacción' },
  speaking: { en: 'Public Speaking', es: 'Oratoria' },
  leadership: { en: 'Leadership', es: 'Liderazgo' },
  'customer-care': { en: 'Customer Care', es: 'Atención al cliente' },
};

/**
 * @param {SiteLanguageId} lang
 */
export function applyPageTranslations(lang) {
  if (typeof document === 'undefined') return;

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (!key) return;
    const entry = PAGE_TRANSLATIONS[key];
    const text = entry?.[lang] ?? entry?.en;
    if (text) element.textContent = text;
  });

  document.querySelectorAll('[data-i18n-skill]').forEach((element) => {
    const skillId = element.getAttribute('data-i18n-skill');
    if (!skillId) return;
    const entry = SKILL_TITLE_TRANSLATIONS[skillId];
    const text = entry?.[lang] ?? entry?.en;
    if (text) element.textContent = text;
  });
}

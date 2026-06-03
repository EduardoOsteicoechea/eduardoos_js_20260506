/** @param {'en' | 'es'} lang */
export function getHomeIntroMessage(lang) {
  if (lang === 'es') {
    return (
      '¿Qué te gustaría saber sobre Eduardo? Puedo compartir información sobre su trayectoria profesional, ' +
      'habilidades en BIM y desarrollo de software, proyectos, servicios y formas de contacto.'
    );
  }

  return (
    'What would you like to know about Eduardo? I can share information about his professional background, ' +
    'BIM and software skills, projects, services, and how to get in touch.'
  );
}

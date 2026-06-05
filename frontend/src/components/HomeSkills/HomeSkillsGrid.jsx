import { HOME_SKILLS } from '../../data/homeSkills';
import SkillIcon from './SkillIcon';

export default function HomeSkillsGrid() {
  return (
    <section className="home-skills" aria-labelledby="home-skills-heading">
      <h2
        id="home-skills-heading"
        className="home-skills__title"
        data-i18n="homeSkillsHeading"
      >
        My skills include
      </h2>

      <ul className="home-skills__grid">
        {HOME_SKILLS.map((skill) => (
          <li key={skill.id}>
            <article className="home-skills__card theme-border">
              <h3
                className="home-skills__card-label"
                data-i18n-skill={skill.id}
              >
                {skill.title}
              </h3>
              <div className="home-skills__card-icon-wrap">
                <div className="home-skills__card-icon">
                  <SkillIcon id={skill.id} className="home-skills__icon" />
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

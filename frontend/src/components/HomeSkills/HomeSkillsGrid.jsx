import { HOME_SKILLS } from '../../data/homeSkills';
import SkillIcon from './SkillIcon';

export default function HomeSkillsGrid() {
  return (
    <section className="home-skills mt-8" aria-labelledby="home-skills-heading">
      <h2
        id="home-skills-heading"
        className="text-2xl font-bold tracking-tight sm:text-3xl"
      >
        My skills include
      </h2>

      <ul className="mt-6 grid list-none grid-cols-1 gap-3 p-0 min-[420px]:grid-cols-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {HOME_SKILLS.map((skill) => (
          <li key={skill.id}>
            <article className="theme-border flex aspect-square flex-col rounded-lg border bg-white/80 p-3 backdrop-blur-[2px] dark:bg-black/75">
              <h3 className="text-center text-[0.65rem] font-semibold uppercase leading-tight tracking-wide sm:text-xs">
                {skill.title}
              </h3>
              <div className="flex min-h-0 flex-1 items-center justify-center px-1 pt-2">
                <div className="h-[55%] w-[55%] max-h-24 max-w-24 opacity-90">
                  <SkillIcon id={skill.id} />
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

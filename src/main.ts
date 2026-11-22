import '@fontsource-variable/dm-sans';
import '@fontsource-variable/bricolage-grotesque';
// the Bulgarian page's (style.css, :lang(bg)): the two above have no Cyrillic; a font is only fetched where it is used
import '@fontsource-variable/rubik';
import '@fontsource-variable/manrope';
import './style.css';
import { markFallback, markReady, scrollStage, shouldStart3D, viewToggle } from 'popfold/fallback';

const cyrillic = document.documentElement.lang === 'bg';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('scene') as HTMLCanvasElement;
// where the story is, from the scroll position: one step per <section class="stage">
const getStage = scrollStage();

async function boot() {
  // the page is already readable without 3D (stills + stories built in by popfoldFallback); upgrade if we can
  if (!shouldStart3D()) { markFallback(); viewToggle(); return; }
  // the screen and poster art is drawn with the web fonts, so wait for them
  // (with Cyrillic on the Bulgarian page, whose art is drawn in Rubik)
  await Promise.all(cyrillic
    ? [document.fonts.load('800 40px "Rubik Variable"', 'Ж'), document.fonts.load('500 40px "Manrope Variable"', 'Ж')]
    : [document.fonts.load('800 40px "Bricolage Grotesque Variable"'), document.fonts.load('500 40px "DM Sans Variable"')],
  ).catch(() => undefined);
  const [{ startScene, createStoryCard }, { NEON, PERSONAL, BEATS }] = await Promise.all([import('popfold'), import('./tower')]);
  const storyCard = createStoryCard();
  const scene = await startScene({
    canvas, reducedMotion, homes: [PERSONAL], home: PERSONAL.id, beats: BEATS,
    avatar: false, // no guide figure on this site
    storyDot: NEON.pink,
    getStage,
    onStory: (story, _key, x, y) => storyCard.open(story, x, y),
    // a click on a floor scrolls to its section (sections are named after the floors)
    onZone: (id) => document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' }),
    onPick: (part) => {
      const id = part === 'left' ? 'security' : part === 'right' ? 'integrations' : 'now';
      document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    },
  });
  scene.setLighting('evening'); // night: the floors' own lights and neon do the work
  // on a phone a floor's card shows its first lines (style.css); a tap on it shows the rest, or folds it again
  for (const card of document.querySelectorAll<HTMLElement>('.stage > article.card')) {
    card.addEventListener('click', (e) => { if (!(e.target as Element).closest('a')) card.classList.toggle('open'); });
  }
  markReady(canvas);
  viewToggle();
}

boot().catch((err) => { console.error(err); markFallback(); viewToggle(); });

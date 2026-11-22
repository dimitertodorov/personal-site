// Popfold Studio for the personal site: http://127.0.0.1:5181/studio.html
import { mountStudio } from 'popfold/studio';
import './card.css';
import { BEATS, NEON, PERSONAL } from './tower';

mountStudio({
  homes: [PERSONAL], beats: BEATS, avatar: false, siteUrl: './',
  storyDot: NEON.pink,
  // the site's night palette (src/style.css)
  theme: {
    ink: '#ECE8FF', inkSoft: '#A9A3C9', paper: '#120C2E', line: '#2C2452',
    accent: '#FF4FD8', accentSoft: '#2A1640', butter: '#3EE6FF', onButter: '#0A0814',
  },
});

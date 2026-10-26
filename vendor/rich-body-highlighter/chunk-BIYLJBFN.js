// src/core/options.ts
var OPTION_KEY_SET = {
  view: 1,
  gender: 1,
  theme: 1,
  highlights: 1,
  width: 1,
  height: 1,
  color: 1,
  blendMode: 1,
  hoverHighlight: 1,
  hoverIntensity: 1,
  hoverColor: 1,
  bodySrc: 1,
  registry: 1,
  className: 1,
  onMuscleEnter: 1,
  onMuscleLeave: 1,
  onMuscleClick: 1
};
var MUSCLE_MAP_OPTION_KEYS = Object.keys(OPTION_KEY_SET);
function pickOptions(source) {
  const out = {};
  for (const key of MUSCLE_MAP_OPTION_KEYS) out[key] = source[key];
  return out;
}

export { pickOptions };

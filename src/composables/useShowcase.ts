import { ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'

// Index of the project nearest the centre of the showcase (what the dots and the
// links follow). ProjectsSection writes it; StageFrame reads it.
const activeIndex = ref(0)

// Numbers that change every frame, shared between the animation loops. Not
// reactive on purpose.
//   q      continuous position along the projects (2.4 = 40% of the way from the
//          third project to the fourth)
//   swell  how high the tide stands while projects change (0..1)
//   f      the moment of the day the sky is at: 0 dawn, 1 midday, 2 afternoon,
//          3 sunset, 4 night
const position = { q: 0, swell: 0, f: 1 }

// True once the sky has gone dark (home page, last stretch): things drawn over it
// switch to light text.
const isNight = ref(false)

// The flying StageFrame follows scroll through JavaScript, which on phones runs
// a frame behind the browser's own scrolling and visibly trembles. So it only
// exists from md up; on phones every block keeps its own glass in the flow.
const isStage = useMediaQuery('(min-width: 768px)')

export function useShowcase() {
  return { activeIndex, isStage, position, isNight }
}

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{ before: string; after: string; alt: string }>()

const { t } = useI18n()

// 0 shows only the "before" picture, 100 only the "after".
const split = ref(50)
const touched = ref(false)
const box = ref<HTMLElement | null>(null)
let dragging = false

const move = (event: PointerEvent) => {
  const el = box.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  split.value = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100))
}
const down = (event: PointerEvent) => {
  dragging = true
  touched.value = true
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  move(event)
}
const drag = (event: PointerEvent) => {
  if (dragging) move(event)
}
const up = () => {
  dragging = false
}
</script>

<template>
  <figure>
    <div
      ref="box"
      class="box"
      @pointerdown="down"
      @pointermove="drag"
      @pointerup="up"
      @pointercancel="up"
    >
      <img :src="after" :alt="`${alt} (${t('compare.after')})`" width="960" height="540" class="layer" draggable="false" />
      <img
        :src="before"
        :alt="`${alt} (${t('compare.before')})`"
        width="960"
        height="540"
        class="layer"
        draggable="false"
        :style="{ clipPath: `inset(0 ${100 - split}% 0 0)` }"
      />

      <span class="tag tag-l">{{ t('compare.before') }}</span>
      <span class="tag tag-r">{{ t('compare.after') }}</span>

      <span class="line" :style="{ left: `${split}%` }" aria-hidden="true">
        <span class="knob">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" /></svg>
        </span>
      </span>

      <input
        v-model.number="split"
        type="range"
        min="0"
        max="100"
        step="1"
        class="sr-only"
        :aria-label="t('compare.hint')"
        @keydown="touched = true"
      />
    </div>
    <figcaption v-if="!touched" class="mt-3 text-sm text-muted">{{ t('compare.hint') }}</figcaption>
  </figure>
</template>

<style scoped>
.box {
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid var(--line);
  cursor: ew-resize;
  touch-action: pan-y;
  user-select: none;
  background: rgb(var(--ink) / 0.05);
}
.box:focus-within {
  outline: 2px solid rgb(var(--accent));
  outline-offset: 3px;
}
.layer {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  object-position: top;
}
.box .layer + .layer {
  position: absolute;
  inset: 0;
}
.line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  translate: -50% 0;
  background: #fff;
  pointer-events: none;
}
.knob {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  height: 2.5rem;
  width: 2.5rem;
  translate: -50% -50%;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #fff;
  color: #14171c;
}
.tag {
  position: absolute;
  top: 0.75rem;
  border-radius: 9999px;
  padding: 0.2rem 0.65rem;
  font-size: 0.8rem;
  font-weight: 600;
  background: rgb(20 23 28 / 0.75);
  color: #fff;
  pointer-events: none;
}
.tag-l {
  left: 0.75rem;
}
.tag-r {
  right: 0.75rem;
}
</style>

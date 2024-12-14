<template>
  <div size-full px-7 py-10 of-x-hidden bg-slate-950>
    <div prose ma>
      <div mb-6 fyc gap-4>
        <Avatar size-14 />
        <CyberpunkGlitch>
          <div text-8 font-thin bg-clip-text text-transparent bg-gradient-to-tr from="#bd34fe" to="#47caff">
            imba久期
          </div>

          <template #background="{ isPlaying }">
            <div
              pa top-0 right-0 bottom-0 left-0 bg-gradient-to-tr from="#bd34fe" to="#47caff" blur-lg op-30
              :class="isPlaying ? 'op-25!' : ''"
            />
          </template>
        </CyberpunkGlitch>
      </div>
    </div>
  </div>
</template>

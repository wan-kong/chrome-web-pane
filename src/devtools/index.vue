<script setup lang="ts">
import NetworkPanel from './components/NetworkPanel.vue'
</script>

<template>
  <main>
    <NetworkPanel />
  </main>
</template>

<style>
:root {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;

  color-scheme: light dark;
  background-color: #242424;
}

@media (prefers-color-scheme: light) {
  :root {
    background-color: #fafafa;
  }
}

body {
  margin: 0;
  padding: 0;
}

main {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>

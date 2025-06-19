<template>
  <div class="json-viewer">
    <pre><code>{{ formattedJson }}</code></pre>
  </div>
</template>

<script setup lang="ts">
interface Props {
  data: any
}

const props = defineProps<Props>()

const formattedJson = JSON.stringify(props.data, null, 2)
</script>

<style scoped>
.json-viewer {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 11px;
}

.json-viewer pre {
  margin: 0;
  padding: 0;
  background: none;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.json-viewer code {
  background: none;
  padding: 0;
  color: #333;
}

@media (prefers-color-scheme: dark) {
  .json-viewer code {
    color: #ccc;
  }
}
</style> 

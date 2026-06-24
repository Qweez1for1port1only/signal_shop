<script setup lang="ts">
import { computed } from "vue";
import { orderStatusText } from "@/utils/format";

const props = defineProps<{
  status: string;
}>();

const tone = computed(() => {
  if (props.status === "paid" || props.status === "completed") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (props.status === "cancelled") {
    return "bg-rose-100 text-rose-700";
  }

  if (props.status === "shipped") {
    return "bg-sky-100 text-sky-700";
  }

  return "bg-amber-100 text-amber-700";
});
</script>

<template>
  <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-bold" :class="tone">
    {{ orderStatusText(status) }}
  </span>
</template>


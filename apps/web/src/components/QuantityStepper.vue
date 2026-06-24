<script setup lang="ts">
import { Minus, Plus } from "@lucide/vue";

const props = defineProps<{
  modelValue: number;
  min?: number;
  max?: number;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

function decrease() {
  emit("update:modelValue", Math.max(props.min ?? 0, props.modelValue - 1));
}

function increase() {
  emit("update:modelValue", Math.min(props.max ?? 99, props.modelValue + 1));
}
</script>

<template>
  <div class="grid h-11 w-32 grid-cols-3 overflow-hidden rounded-full border-2 border-ink bg-white">
    <button class="grid place-items-center text-steel hover:bg-slate-100" type="button" title="Уменьшить" @click="decrease">
      <Minus class="size-4" />
    </button>
    <span class="grid place-items-center text-sm font-bold text-ink">{{ modelValue }}</span>
    <button class="grid place-items-center text-steel hover:bg-slate-100" type="button" title="Увеличить" @click="increase">
      <Plus class="size-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { cn } from "@/lib/utils";
import { ref, useId } from "vue";

const props = defineProps<{
  type: "date" | "month" | "year";
  yearError: boolean;
  monthError: boolean;
  dayError: boolean;
}>();

const yearModel = defineModel<string>("year", { required: true });
const monthModel = defineModel<string>("month", { required: true });
const dayModel = defineModel<string>("day", { required: true });

const emit = defineEmits<{
  "blur:year": [event: FocusEvent];
  "blur:month": [event: FocusEvent];
  "blur:day": [event: FocusEvent];
  "blur:root": [event: FocusEvent];
}>();

const rootRef = ref<HTMLDivElement>();
const uniqueId = useId();

const checkRootFocusOut = (event: FocusEvent) => {
  const relatedTarget = event.relatedTarget as Node | null;

  if (!relatedTarget || !rootRef.value?.contains(relatedTarget)) {
    emit("blur:root", event);
  }
};

const handleYearBlur = (event: FocusEvent) => {
  emit("blur:year", event);
  checkRootFocusOut(event);
};

const handleMonthBlur = (event: FocusEvent) => {
  emit("blur:month", event);
  checkRootFocusOut(event);
};

const handleDayBlur = (event: FocusEvent) => {
  emit("blur:day", event);
  checkRootFocusOut(event);
};
</script>

<template>
  <div ref="rootRef" class="flex-1 flex gap-2 items-center">
    <div class="flex items-center gap-1">
      <input
        :id="`${uniqueId}-year`"
        v-model="yearModel"
        type="text"
        :class="cn('border rounded px-3 py-2 w-16', { 'border-red-600': yearError })"
        :aria-invalid="yearError"
        @blur="handleYearBlur"
      />
      <label :for="`${uniqueId}-year`" class="text-sm text-gray-600 cursor-pointer">年</label>
    </div>
    <div v-if="props.type === 'date' || props.type === 'month'" class="flex items-center gap-1">
      <input
        :id="`${uniqueId}-month`"
        v-model="monthModel"
        type="text"
        :class="cn('border rounded px-3 py-2 w-12', { 'border-red-600': monthError })"
        :aria-invalid="monthError"
        @blur="handleMonthBlur"
      />
      <label :for="`${uniqueId}-month`" class="text-sm text-gray-600 cursor-pointer">月</label>
    </div>
    <div v-if="props.type === 'date'" class="flex items-center gap-1">
      <input
        :id="`${uniqueId}-day`"
        v-model="dayModel"
        type="text"
        :class="cn('border rounded px-3 py-2 w-12', { 'border-red-600': dayError })"
        :aria-invalid="dayError"
        @blur="handleDayBlur"
      />
      <label :for="`${uniqueId}-day`" class="text-sm text-gray-600 cursor-pointer">日</label>
    </div>
  </div>
</template>

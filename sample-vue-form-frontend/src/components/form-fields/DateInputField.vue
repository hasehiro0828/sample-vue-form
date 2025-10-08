<script setup lang="ts">
import { useField, useFormContext } from "vee-validate";
import AppDateInput from "@/components/app-ui/AppDateInput/AppDateInput.vue";
import { computed } from "vue";
import { shouldShowError } from "./utils";

const props = defineProps<{
  namePrefix: string;
  type: "date" | "month" | "year";
}>();

const { submitCount, errors } = useFormContext();

const yearField = useField<string>(`${props.namePrefix}.year`);
const monthField = useField<string>(`${props.namePrefix}.month`);
const dayField = useField<string>(`${props.namePrefix}.day`);

const rootErrorMessage = computed(() => errors.value[props.namePrefix]);

const shouldShowRootError = computed(() => {
  return [yearField.meta, monthField.meta, dayField.meta].some((meta) =>
    shouldShowError(submitCount.value, meta, rootErrorMessage.value)
  );
});

const handleRootBlur = (e: FocusEvent, blurs: ((event: FocusEvent) => void)[]) => {
  blurs.forEach((blur) => blur(e));
};
</script>

<template>
  <div>
    <AppDateInput
      v-model:year="yearField.value.value"
      v-model:month="monthField.value.value"
      v-model:day="dayField.value.value"
      :type="props.type"
      :year-error="shouldShowError(submitCount, yearField.meta, yearField.errorMessage.value)"
      :month-error="shouldShowError(submitCount, monthField.meta, monthField.errorMessage.value)"
      :day-error="shouldShowError(submitCount, dayField.meta, dayField.errorMessage.value)"
      @update:year="yearField.handleChange"
      @update:month="monthField.handleChange"
      @update:day="dayField.handleChange"
      @blur:year="yearField.handleBlur"
      @blur:month="monthField.handleBlur"
      @blur:day="dayField.handleBlur"
      @blur:root="(e) => handleRootBlur(e, [yearField.handleBlur, monthField.handleBlur, dayField.handleBlur])"
    />

    <div class="text-sm text-red-600">
      <p v-if="shouldShowRootError">
        {{ rootErrorMessage }}
      </p>
      <template v-else>
        <p v-if="shouldShowError(submitCount, yearField.meta, yearField.errorMessage.value)">
          {{ yearField.errorMessage.value }}
        </p>
        <p v-else-if="shouldShowError(submitCount, monthField.meta, monthField.errorMessage.value)">
          {{ monthField.errorMessage.value }}
        </p>
        <p v-else-if="shouldShowError(submitCount, dayField.meta, dayField.errorMessage.value)">
          {{ dayField.errorMessage.value }}
        </p>
      </template>
    </div>
  </div>
</template>

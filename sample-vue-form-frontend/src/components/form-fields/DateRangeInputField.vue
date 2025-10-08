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

const fromYearField = useField<string>(`${props.namePrefix}.from.year`);
const fromMonthField = useField<string>(`${props.namePrefix}.from.month`);
const fromDayField = useField<string>(`${props.namePrefix}.from.day`);
const toYearField = useField<string>(`${props.namePrefix}.to.year`);
const toMonthField = useField<string>(`${props.namePrefix}.to.month`);
const toDayField = useField<string>(`${props.namePrefix}.to.day`);

const rootErrorMessage = computed(() => errors.value[props.namePrefix]);

const shouldShowRootError = computed(() => {
  return [
    fromYearField.meta,
    fromMonthField.meta,
    fromDayField.meta,
    toYearField.meta,
    toMonthField.meta,
    toDayField.meta,
  ].some((meta) => shouldShowError(submitCount.value, meta, rootErrorMessage.value));
});

const handleRootBlur = (e: FocusEvent, blurs: ((event: FocusEvent) => void)[]) => {
  blurs.forEach((blur) => blur(e));
};
</script>

<template>
  <div>
    <div class="flex gap-4 items-start">
      <!-- From -->
      <div class="flex-1">
        <AppDateInput
          v-model:year="fromYearField.value.value"
          v-model:month="fromMonthField.value.value"
          v-model:day="fromDayField.value.value"
          :type="props.type"
          :year-error="shouldShowError(submitCount, fromYearField.meta, fromYearField.errorMessage.value)"
          :month-error="shouldShowError(submitCount, fromMonthField.meta, fromMonthField.errorMessage.value)"
          :day-error="shouldShowError(submitCount, fromDayField.meta, fromDayField.errorMessage.value)"
          @update:year="fromYearField.handleChange"
          @update:month="fromMonthField.handleChange"
          @update:day="fromDayField.handleChange"
          @blur:year="fromYearField.handleBlur"
          @blur:month="fromMonthField.handleBlur"
          @blur:day="fromDayField.handleBlur"
          @blur:root="
            (e) => handleRootBlur(e, [fromYearField.handleBlur, fromMonthField.handleBlur, fromDayField.handleBlur])
          "
        />
        <div v-if="!shouldShowRootError" class="text-sm text-red-600">
          <p v-if="shouldShowError(submitCount, fromYearField.meta, fromYearField.errorMessage.value)">
            {{ fromYearField.errorMessage.value }}
          </p>
          <p v-else-if="shouldShowError(submitCount, fromMonthField.meta, fromMonthField.errorMessage.value)">
            {{ fromMonthField.errorMessage.value }}
          </p>
          <p v-else-if="shouldShowError(submitCount, fromDayField.meta, fromDayField.errorMessage.value)">
            {{ fromDayField.errorMessage.value }}
          </p>
        </div>
      </div>

      <span class="text-gray-500 mt-2">〜</span>

      <!-- To -->
      <div class="flex-1">
        <AppDateInput
          v-model:year="toYearField.value.value"
          v-model:month="toMonthField.value.value"
          v-model:day="toDayField.value.value"
          :type="props.type"
          :year-error="shouldShowError(submitCount, toYearField.meta, toYearField.errorMessage.value)"
          :month-error="shouldShowError(submitCount, toMonthField.meta, toMonthField.errorMessage.value)"
          :day-error="shouldShowError(submitCount, toDayField.meta, toDayField.errorMessage.value)"
          @update:year="toYearField.handleChange"
          @update:month="toMonthField.handleChange"
          @update:day="toDayField.handleChange"
          @blur:year="toYearField.handleBlur"
          @blur:month="toMonthField.handleBlur"
          @blur:day="toDayField.handleBlur"
          @blur:root="
            (e) => handleRootBlur(e, [toYearField.handleBlur, toMonthField.handleBlur, toDayField.handleBlur])
          "
        />
        <div v-if="!shouldShowRootError" class="text-sm text-red-600">
          <p v-if="shouldShowError(submitCount, toYearField.meta, toYearField.errorMessage.value)">
            {{ toYearField.errorMessage.value }}
          </p>
          <p v-else-if="shouldShowError(submitCount, toMonthField.meta, toMonthField.errorMessage.value)">
            {{ toMonthField.errorMessage.value }}
          </p>
          <p v-else-if="shouldShowError(submitCount, toDayField.meta, toDayField.errorMessage.value)">
            {{ toDayField.errorMessage.value }}
          </p>
        </div>
      </div>
    </div>

    <div class="text-sm text-red-600">
      <p v-if="shouldShowRootError">
        {{ rootErrorMessage }}
      </p>
    </div>
  </div>
</template>

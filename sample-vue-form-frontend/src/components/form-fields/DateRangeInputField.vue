<script setup lang="ts">
import { useField, useFormContext } from "vee-validate";
import AppDateInput from "@/components/app-ui/AppDateInput/AppDateInput.vue";
import { computed } from "vue";
import { satisfiesErrorDisplayCondition } from "./utils";

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
  const hasAnyFieldError = [
    !fromYearField.meta.valid,
    !fromMonthField.meta.valid,
    !fromDayField.meta.valid,
    !toYearField.meta.valid,
    !toMonthField.meta.valid,
    !toDayField.meta.valid,
  ].some((hasError) => hasError);

  if (hasAnyFieldError) return false;

  return (
    [
      fromYearField.meta,
      fromMonthField.meta,
      fromDayField.meta,
      toYearField.meta,
      toMonthField.meta,
      toDayField.meta,
    ].some((meta) => satisfiesErrorDisplayCondition(submitCount.value, meta)) && !!rootErrorMessage.value
  );
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
          :year-error="
            satisfiesErrorDisplayCondition(submitCount, fromYearField.meta) && !!fromYearField.errorMessage.value
          "
          :month-error="
            satisfiesErrorDisplayCondition(submitCount, fromMonthField.meta) && !!fromMonthField.errorMessage.value
          "
          :day-error="
            satisfiesErrorDisplayCondition(submitCount, fromDayField.meta) && !!fromDayField.errorMessage.value
          "
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
          <p
            v-if="satisfiesErrorDisplayCondition(submitCount, fromYearField.meta) && !!fromYearField.errorMessage.value"
          >
            {{ fromYearField.errorMessage.value }}
          </p>
          <p
            v-else-if="
              satisfiesErrorDisplayCondition(submitCount, fromMonthField.meta) && !!fromMonthField.errorMessage.value
            "
          >
            {{ fromMonthField.errorMessage.value }}
          </p>
          <p
            v-else-if="
              satisfiesErrorDisplayCondition(submitCount, fromDayField.meta) && !!fromDayField.errorMessage.value
            "
          >
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
          :year-error="
            satisfiesErrorDisplayCondition(submitCount, toYearField.meta) && !!toYearField.errorMessage.value
          "
          :month-error="
            satisfiesErrorDisplayCondition(submitCount, toMonthField.meta) && !!toMonthField.errorMessage.value
          "
          :day-error="satisfiesErrorDisplayCondition(submitCount, toDayField.meta) && !!toDayField.errorMessage.value"
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
          <p v-if="satisfiesErrorDisplayCondition(submitCount, toYearField.meta) && !!toYearField.errorMessage.value">
            {{ toYearField.errorMessage.value }}
          </p>
          <p
            v-else-if="
              satisfiesErrorDisplayCondition(submitCount, toMonthField.meta) && !!toMonthField.errorMessage.value
            "
          >
            {{ toMonthField.errorMessage.value }}
          </p>
          <p
            v-else-if="satisfiesErrorDisplayCondition(submitCount, toDayField.meta) && !!toDayField.errorMessage.value"
          >
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

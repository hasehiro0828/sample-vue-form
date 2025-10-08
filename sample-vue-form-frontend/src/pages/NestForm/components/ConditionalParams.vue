<script setup lang="ts">
import { ErrorMessage, Field, useFieldArray, useFormContext } from "vee-validate";
import type { z } from "zod";

import DateInputField from "@/components/form-fields/DateInputField.vue";
import DateRangeInputField from "@/components/form-fields/DateRangeInputField.vue";
import { satisfiesErrorDisplayCondition } from "@/components/form-fields/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { computed, ref } from "vue";
import type { paramSchema } from "../form-schema";

type Param = z.infer<typeof paramSchema>;

const props = defineProps<{
  index: number;
}>();

const paramKey = computed(() => `conditions[${String(props.index)}].params`);

const { submitCount } = useFormContext();
const { fields: params, remove, push } = useFieldArray<Param>(paramKey.value);

const selectedType = ref<string>("text");

const handleRemoveParam = (paramIndex: number): void => {
  if (params.value.length <= 1) return;

  remove(paramIndex);
};

const handleAddParam = (): void => {
  const base = { required: true, readonly: { title: "", description: "" } };

  switch (selectedType.value) {
    case "text":
      push({ ...base, type: "text", value: { text: "" } });
      break;
    case "date":
      push({ ...base, type: "date", value: { year: "", month: "", day: "" } });
      break;
    case "month":
      push({ ...base, type: "month", value: { year: "", month: "" } });
      break;
    case "year":
      push({ ...base, type: "year", value: { year: "" } });
      break;
    case "date_range":
      push({
        ...base,
        type: "date_range",
        value: { from: { year: "", month: "", day: "" }, to: { year: "", month: "", day: "" } },
      });
      break;
    case "month_range":
      push({ ...base, type: "month_range", value: { from: { year: "", month: "" }, to: { year: "", month: "" } } });
      break;
    case "year_range":
      push({ ...base, type: "year_range", value: { from: { year: "" }, to: { year: "" } } });
      break;
    default:
      push({ ...base, type: "text", value: { text: "" } });
      break;
  }
};
</script>

<template>
  <div class="p-4 border rounded space-y-4">
    <div v-for="(param, paramIdx) in params" :key="param.key" class="space-y-2">
      <div class="flex">
        <div class="flex flex-col grow">
          <label>
            {{ param.value.readonly.title }}
            <span v-if="param.value.required" class="text-red-600 bg-red-100 px-1 py-0.5 rounded-md text-xs">必須</span>
          </label>
          <small class="text-gray-500">{{ param.value.readonly.description }}</small>
        </div>

        <div class="flex gap-2">
          <Button
            v-if="params.length > 1"
            type="button"
            variant="destructive"
            size="sm"
            @click="() => handleRemoveParam(paramIdx)"
          >
            パラメータ削除
          </Button>
        </div>
      </div>

      <div>
        <template v-if="param.value.type === 'text'">
          <Field v-slot="{ field, meta, errorMessage }" :name="`${paramKey}[${paramIdx}].value.text`">
            <div class="flex-1">
              <Input
                v-model="field.value"
                type="text"
                @update:model-value="field.onChange"
                @blur="field.onBlur"
                :aria-invalid="satisfiesErrorDisplayCondition(submitCount, meta) && !!errorMessage"
              />
              <p
                v-if="satisfiesErrorDisplayCondition(submitCount, meta) && !!errorMessage"
                class="text-sm text-red-600 mt-1"
              >
                {{ errorMessage }}
              </p>
            </div>
          </Field>
        </template>

        <template
          v-else-if="
            param.value.type === 'date_range' || param.value.type === 'month_range' || param.value.type === 'year_range'
          "
        >
          <DateRangeInputField
            :name-prefix="`${paramKey}[${paramIdx}].value`"
            :type="param.value.type === 'date_range' ? 'date' : param.value.type === 'month_range' ? 'month' : 'year'"
          />
        </template>

        <template v-else>
          <DateInputField :name-prefix="`${paramKey}[${paramIdx}].value`" :type="param.value.type" />
        </template>
      </div>
    </div>

    <ErrorMessage v-slot="{ message }" :name="paramKey">
      <p class="text-sm text-red-600 mb-2">{{ message }}</p>
    </ErrorMessage>

    <div class="flex gap-2">
      <Select v-model="selectedType">
        <SelectTrigger size="sm" class="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="text">テキスト</SelectItem>
          <SelectItem value="date">年月日</SelectItem>
          <SelectItem value="month">年月</SelectItem>
          <SelectItem value="year">年</SelectItem>
          <SelectItem value="date_range">年月日範囲</SelectItem>
          <SelectItem value="month_range">年月範囲</SelectItem>
          <SelectItem value="year_range">年範囲</SelectItem>
        </SelectContent>
      </Select>
      <Button type="button" @click="handleAddParam">パラメータを追加</Button>
    </div>
  </div>
</template>

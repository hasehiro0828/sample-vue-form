<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { Field, useFieldArray, useForm } from "vee-validate";
import { computed, useId, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { z } from "zod";

import { useNestFormQuery } from "@/api/use-query/use-nest-form-query";
import { satisfiesErrorDisplayCondition } from "@/components/form-fields/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ConditionalParams from "./components/ConditionalParams.vue";
import { conditionSchema, formSchema } from "./form-schema";

const route = useRoute();
const router = useRouter();

const id = computed(() => route.params.id as string);

const { data, isLoading } = useNestFormQuery(id);

const { handleSubmit, values, errors, meta, resetForm, submitCount } = useForm({
  validationSchema: toTypedSchema(formSchema),
});

const {
  fields: conditionFields,
  remove: removeCondition,
  push: pushCondition,
} = useFieldArray<z.infer<typeof conditionSchema>>("conditions");

watch(data, (newData) => {
  if (!newData) return;

  resetForm({ values: newData });
});

const goToPrev = (): void => {
  const currentId = Number.parseInt(id.value);

  if (currentId > 1) {
    router.push(`/nest-form/${currentId - 1}`);
  }
};

const goToNext = (): void => {
  const currentId = Number.parseInt(id.value);
  router.push(`/nest-form/${currentId + 1}`);
};

const onSubmit = handleSubmit(
  (formValues) => {
    try {
      console.log("Form submitted:", formValues);
      // TODO: ここにAPIリクエストなどの処理を追加
    } catch (error) {
      console.error("Form submission error:", error);
    }
  },
  (errors) => {
    console.error("Validation errors:", errors);
  }
);

const addCondition = (): void => {
  pushCondition({
    params: [
      {
        type: "text" as const,
        value: { text: "" },
        required: true,
        readonly: { title: "追加された条件のパラメータ", description: "追加された条件のパラメータの説明" },
      },
    ],
    readonly: { title: "追加された条件", description: "追加された条件の説明" },
  });
};

const nameId = useId();
const descriptionId = useId();
</script>

<template>
  <div class="p-4 flex">
    <div class="w-1/2">
      <div class="flex justify-between items-center mb-4">
        <Button type="button" @click="goToPrev" :disabled="Number.parseInt(id) <= 1"> ← 前のページ </Button>
        <span class="text-lg font-semibold">ID: {{ id }}</span>
        <Button type="button" @click="goToNext"> 次のページ → </Button>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center p-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>

      <form v-else class="flex flex-col gap-4" @submit="onSubmit">
        <Field v-slot="{ field, meta, errorMessage }" name="name">
          <div class="flex flex-col gap-2">
            <label :for="nameId">
              名前
              <span class="text-red-600 bg-red-100 px-1 py-0.5 rounded-md text-xs ml-1">必須</span>
            </label>
            <Input
              :id="nameId"
              :model-value="field.value"
              type="text"
              :aria-invalid="satisfiesErrorDisplayCondition(submitCount, meta) && !!errorMessage"
              @update:model-value="field.onChange"
              @blur="field.onBlur"
            />
            <p v-if="satisfiesErrorDisplayCondition(submitCount, meta) && !!errorMessage" class="text-sm text-red-600">
              {{ errorMessage }}
            </p>
          </div>
        </Field>

        <Field v-slot="{ field, meta, errorMessage }" name="description">
          <div class="flex flex-col gap-2">
            <label :for="descriptionId">
              概要
              <span class="text-red-600 bg-red-100 px-1 py-0.5 rounded-md text-xs ml-1">必須</span>
            </label>
            <Textarea
              :id="descriptionId"
              :model-value="field.value"
              :aria-invalid="satisfiesErrorDisplayCondition(submitCount, meta) && !!errorMessage"
              @update:model-value="field.onChange"
              @blur="field.onBlur"
            />
            <p v-if="satisfiesErrorDisplayCondition(submitCount, meta) && !!errorMessage" class="text-sm text-red-600">
              {{ errorMessage }}
            </p>
          </div>
        </Field>

        <div class="flex flex-col gap-2">
          <label>
            条件
            <span class="text-red-600 bg-red-100 px-1 py-0.5 rounded-md text-xs ml-1">必須</span>
          </label>

          <div
            v-for="(condition, conditionIdx) in conditionFields"
            :key="condition.key"
            class="p-4 border border-gray-300 rounded"
          >
            <div class="mb-2">
              <div class="font-bold">{{ condition.value.readonly.title }}</div>
              <div class="text-gray-500 text-sm">{{ condition.value.readonly.description }}</div>
            </div>

            <div class="flex justify-end mb-2">
              <Button
                v-if="conditionFields.length > 1"
                type="button"
                variant="destructive"
                size="sm"
                @click="() => removeCondition(conditionIdx)"
              >
                条件を削除
              </Button>
            </div>

            <ConditionalParams :index="conditionIdx" />
          </div>
        </div>

        <Button type="button" @click="addCondition">条件を追加</Button>
        <Button type="submit" class="mt-4">送信</Button>
      </form>
    </div>

    <div class="w-1/2 text-xs pl-4">
      <div class="mt-4 p-4 bg-gray-100 rounded">
        <h3 class="font-bold mb-2">フォームの状態：</h3>
        <pre class="overflow-auto max-h-100">{{ values }}</pre>
      </div>
      <div class="mt-4 p-4 bg-gray-100 rounded">
        <h3 class="font-bold mb-2">errors：</h3>
        <pre class="overflow-auto max-h-100">{{ errors }}</pre>
      </div>
      <div class="mt-4 p-4 bg-gray-100 rounded">
        <h3 class="font-bold mb-2">meta：</h3>
        <pre class="overflow-auto max-h-100">{{ meta }}</pre>
      </div>
    </div>
  </div>
</template>

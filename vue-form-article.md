# vue-query、vee-validate、shadcn-vue、Zodを使ったフォーム開発方法

## はじめに

本記事では、Vue 3を使用したモダンなフォーム開発の実装方法について解説します。主にvee-validateとZodを使用したバリデーション付きフォームの開発に焦点を当て、実際のプロジェクトで使用されているコードを例に、実践的な実装パターンを紹介します。

### 使用する主要ライブラリ

- **vee-validate**: Vue向けのフォームバリデーションライブラリ
- **Zod**: TypeScript-firstなスキーマバリデーションライブラリ
- **vue-query (TanStack Query)**: データフェッチングとキャッシング管理
- **shadcn-vue**: Radix UIベースのコンポーネントライブラリ

## プロジェクトのセットアップ

まず、必要なパッケージをインストールします：

```json
{
  "dependencies": {
    "@tanstack/vue-query": "^5.90.2",
    "@vee-validate/zod": "^4.15.1",
    "vee-validate": "^4.15.1",
    "zod": "^4.1.12",
    "vue": "^3.5.22"
  }
}
```

## vee-validateとZodの基本的な使い方

### スキーマの定義

Zodを使用してフォームのスキーマを定義します。日本語のエラーメッセージにも対応しています：

```typescript
import { z } from "zod";
import ja from "zod/v4/locales/ja.js";

// 日本語ロケールを設定
z.config(ja());

// フォームスキーマの定義
export const formSchema = z.object({
  name: z.string().min(1, { message: "名前は必須です" }),
  description: z.string().min(1, { message: "概要は必須です" }),
  conditions: z.array(conditionSchema).min(1, { message: "少なくとも1つの条件が必要です" }),
});
```

### vee-validateの設定

vee-validateとZodスキーマを統合します：

```typescript
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";

const { handleSubmit, values, errors, meta, resetForm, submitCount } = useForm({
  validationSchema: toTypedSchema(formSchema),
});
```

## Fieldコンポーネントを使った基本的なフォーム実装

vee-validateのFieldコンポーネントを使用することで、フォームフィールドの状態管理とバリデーションを簡単に実装できます。

### テキスト入力フィールドの実装例

```vue
<script setup lang="ts">
import { Field, useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { Input } from "@/components/ui/input";
import { useId } from "vue";
import { satisfiesErrorDisplayCondition } from "@/components/form-fields/utils";

const nameId = useId();
const { submitCount } = useForm({
  validationSchema: toTypedSchema(formSchema),
});
</script>

<template>
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
</template>
```

### ポイント

1. **Fieldコンポーネント**: `v-slot`を使用してfield、meta、errorMessageにアクセス
2. **アクセシビリティ**: `aria-invalid`属性でスクリーンリーダーにエラー状態を伝達
3. **ユニークID**: `useId()`を使用してアクセシブルなラベルとの関連付け

## useFieldArrayを使った配列フォームの実装

動的に追加・削除できる配列フォームの実装には`useFieldArray`を使用します。

### 配列フォームの実装例

```vue
<script setup lang="ts">
import { useFieldArray, useForm } from "vee-validate";
import type { z } from "zod";
import { conditionSchema } from "./form-schema";

const {
  fields: conditionFields,
  remove: removeCondition,
  push: pushCondition,
} = useFieldArray<z.infer<typeof conditionSchema>>("conditions");

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
</script>

<template>
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
</template>
```

### ネストした配列の扱い

配列の中でさらに配列を扱う場合も、同様にuseFieldArrayを使用できます：

```vue
<script setup lang="ts">
const paramKey = computed(() => `conditions[${String(props.index)}].params`);
const { fields: params, remove, push } = useFieldArray<Param>(paramKey.value);
</script>
```

## useFieldを使ったカスタムコンポーネントの実装

複雑な入力コンポーネントを作成する場合は、`useField`を使用して個別のフィールドを管理します。

### 日付入力コンポーネントの実装例

```vue
<script setup lang="ts">
import { useField, useFormContext } from "vee-validate";
import { computed } from "vue";
import { satisfiesErrorDisplayCondition } from "./utils";

const props = defineProps<{
  namePrefix: string;
  type: "date" | "month" | "year";
}>();

const { submitCount, errors } = useFormContext();

// 個別のフィールドを管理
const yearField = useField<string>(`${props.namePrefix}.year`);
const monthField = useField<string>(`${props.namePrefix}.month`);
const dayField = useField<string>(`${props.namePrefix}.day`);

// ルートレベルのエラーメッセージ
const rootErrorMessage = computed(() => errors.value[props.namePrefix]);

// エラー表示条件の判定
const shouldShowRootError = computed(() => {
  const hasAnyFieldError = [!yearField.meta.valid, !monthField.meta.valid, !dayField.meta.valid].some(
    (hasError) => hasError
  );

  if (hasAnyFieldError) return false;

  return (
    [yearField.meta, monthField.meta, dayField.meta].some((meta) =>
      satisfiesErrorDisplayCondition(submitCount.value, meta)
    ) && !!rootErrorMessage.value
  );
});
</script>

<template>
  <div>
    <AppDateInput
      v-model:year="yearField.value.value"
      v-model:month="monthField.value.value"
      v-model:day="dayField.value.value"
      :type="props.type"
      :year-error="satisfiesErrorDisplayCondition(submitCount, yearField.meta) && !!yearField.errorMessage.value"
      :month-error="satisfiesErrorDisplayCondition(submitCount, monthField.meta) && !!monthField.errorMessage.value"
      :day-error="satisfiesErrorDisplayCondition(submitCount, dayField.meta) && !!dayField.errorMessage.value"
      @update:year="yearField.handleChange"
      @update:month="monthField.handleChange"
      @update:day="dayField.handleChange"
      @blur:year="yearField.handleBlur"
      @blur:month="monthField.handleBlur"
      @blur:day="dayField.handleBlur"
    />

    <!-- エラーメッセージの表示 -->
    <div class="text-sm text-red-600">
      <p v-if="shouldShowRootError">
        {{ rootErrorMessage }}
      </p>
      <template v-else>
        <!-- 個別フィールドのエラー表示 -->
      </template>
    </div>
  </div>
</template>
```

### カスタムバリデーションの実装

Zodのrefineメソッドを使用して、複雑なバリデーションルールを実装できます：

```typescript
const dateParamSchema = baseParamSchema
  .extend({
    type: z.literal("date"),
    value: zodDateValue,
  })
  .refine(
    (data) => {
      if (!data.required) return true;
      return data.value.year && data.value.month && data.value.day;
    },
    {
      message: "日付を入力してください",
      path: ["value"],
    }
  )
  .refine(
    (data) => {
      const hasAnyValue = data.value.year || data.value.month || data.value.day;
      const hasAllValues = data.value.year && data.value.month && data.value.day;
      if (!hasAnyValue) return true;
      return hasAllValues;
    },
    {
      message: "日付を完全に入力するか、すべてクリアしてください",
      path: ["value"],
    }
  );
```

## アクセシビリティとユーザビリティを意識したエラーメッセージの表示条件

エラーメッセージの表示タイミングは、ユーザー体験に大きく影響します。本プロジェクトでは、以下の条件でエラーメッセージを表示しています：

### エラー表示条件の実装

```typescript
export const satisfiesErrorDisplayCondition = (submitCount: number, meta: { touched: boolean; dirty: boolean }) => {
  return submitCount > 0 || (meta.touched && meta.dirty);
};
```

この条件により：

1. **初回表示時はエラーを表示しない**: ユーザーがまだ何も入力していない状態でエラーを表示しない
2. **フォーム送信後は常にエラーを表示**: `submitCount > 0`の条件により、一度でも送信を試みた後はリアルタイムでエラーを表示
3. **フィールドの編集後にエラーを表示**: `meta.touched && meta.dirty`により、フィールドにフォーカスし、値を変更した後にエラーを表示

### 複数フィールドのエラー管理

日付入力のような複数のフィールドで構成されるコンポーネントでは、エラーの優先順位を管理する必要があります：

```vue
<template>
  <div class="text-sm text-red-600">
    <p v-if="shouldShowRootError">
      {{ rootErrorMessage }}
    </p>
    <template v-else>
      <p v-if="satisfiesErrorDisplayCondition(submitCount, yearField.meta) && yearField.errorMessage.value">
        {{ yearField.errorMessage.value }}
      </p>
      <p v-else-if="satisfiesErrorDisplayCondition(submitCount, monthField.meta) && monthField.errorMessage.value">
        {{ monthField.errorMessage.value }}
      </p>
      <p v-else-if="satisfiesErrorDisplayCondition(submitCount, dayField.meta) && dayField.errorMessage.value">
        {{ dayField.errorMessage.value }}
      </p>
    </template>
  </div>
</template>
```

## vue-queryとshadcn-vueの概要

### vue-query (TanStack Query)

vue-queryは、サーバーステートの管理を簡単にするライブラリです。本プロジェクトでは、フォームの初期データの取得に使用しています：

```typescript
import { useQuery } from "@tanstack/vue-query";

export const useNestFormQuery = (id: ComputedRef<string>) => {
  return useQuery({
    queryKey: ["nestForm", id],
    queryFn: async () => {
      const result = apiClient.getNestForm(id.value);
      await sleep(300);
      return result;
    },
  });
};
```

フォームコンポーネントでの使用例：

```vue
<script setup lang="ts">
const { data, isLoading } = useNestFormQuery(id);

// データが取得されたらフォームにセット
watch(data, (newData) => {
  if (!newData) return;
  resetForm({ values: newData });
});
</script>
```

### shadcn-vue

shadcn-vueは、Radix UIをベースにしたコンポーネントライブラリで、アクセシブルでカスタマイズ可能なUIコンポーネントを提供します。本プロジェクトでは、Input、Button、Select、Textareaなどの基本的なフォームコンポーネントに使用しています。

使用例：

```vue
<template>
  <Input
    :model-value="field.value"
    type="text"
    @update:model-value="field.onChange"
    @blur="field.onBlur"
  />
  
  <Button type="submit" class="mt-4">送信</Button>
  
  <Select v-model="selectedType">
    <SelectTrigger size="sm" class="w-[200px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="text">テキスト</SelectItem>
      <SelectItem value="date">年月日</SelectItem>
    </SelectContent>
  </Select>
</template>
```

## まとめ

本記事では、Vue 3でvee-validateとZodを使用した実践的なフォーム開発方法について解説しました。

### 重要なポイント

1. **Fieldコンポーネントの活用**: 基本的なフォームフィールドにはFieldコンポーネントを使用し、シンプルな実装を心がける

2. **useFieldArrayで配列を管理**: 動的な配列フォームの実装にはuseFieldArrayを使用し、追加・削除機能を実装

3. **useFieldでカスタムコンポーネント**: 複雑な入力コンポーネントはuseFieldを使用して個別のフィールドを管理

4. **ユーザビリティを考慮したエラー表示**: 適切なタイミングでエラーメッセージを表示し、ユーザーの混乱を避ける

5. **TypeScriptとの統合**: ZodスキーマとTypeScriptの型を活用し、型安全な実装を実現

これらの実装パターンを活用することで、保守性が高く、ユーザーフレンドリーなフォームを効率的に開発できます。実際のプロジェクトでは、要件に応じてこれらのパターンをカスタマイズして使用してください。

### 参考リンク

- [vee-validate公式ドキュメント](https://vee-validate.logaretm.com/v4/)
- [Zod公式ドキュメント](https://zod.dev/)
- [TanStack Query公式ドキュメント](https://tanstack.com/query/latest)
- [shadcn-vue公式サイト](https://www.shadcn-vue.com/)
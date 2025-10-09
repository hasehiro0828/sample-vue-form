# Vue 3でvee-validateとZodを使った堅牢なフォーム開発

## 概要

本記事では、Vue 3でvee-validateとZodを使った型安全で保守性の高いフォーム開発の実装方法を解説します。補助的にvue-queryとshadcn-vueも使用し、データ取得からバリデーション、UI実装までの一連の流れを紹介します。

## 使用技術

### メイン技術

- **vee-validate (v4.15.1)**: Vueのフォームバリデーションライブラリ
- **Zod (v4.1.12)**: TypeScript優先のスキーマバリデーションライブラリ

### サブ技術

- **vue-query (@tanstack/vue-query v5.90.2)**: データフェッチングとキャッシング管理
  - サーバーからのデータ取得とローディング状態の管理を簡潔に実装
  - 本記事ではフォーム初期値の取得に使用

- **shadcn-vue**: 再利用可能なUIコンポーネント
  - Tailwind CSSベースの美しいコンポーネント群
  - 本記事ではButton、Input、Select等の基本UIコンポーネントとして使用

## フォーム開発の基本方針

実装にあたり、以下の方針を採用しています：

1. **基本的にFieldコンポーネントを使用**
2. **配列フィールドにはuseFieldArrayを使用**
3. **vee-validateを組み込んだカスタムコンポーネントではuseFieldを使用**
4. **アクセシビリティとユーザビリティを意識したエラーメッセージ表示**

## Zodスキーマの定義

まず、フォームのバリデーションルールをZodスキーマで定義します。Zodを使うことで、TypeScriptの型とバリデーションルールを一元管理できます。

```typescript
import { z } from "zod";
import ja from "zod/v4/locales/ja.js";

// 日本語のエラーメッセージを設定
z.config(ja());

// フォーム全体のスキーマ
export const formSchema = z.object({
  name: z.string().min(1, { message: "名前は必須です" }),
  description: z.string().min(1, { message: "概要は必須です" }),
  conditions: z.array(conditionSchema).min(1, { 
    message: "少なくとも1つの条件が必要です" 
  }),
});

// ネストされた条件のスキーマ
export const conditionSchema = z.object({
  params: z.array(paramSchema).min(1, { 
    message: "少なくとも1つのパラメータが必要です" 
  }),
  readonly: z.object({
    title: z.string(),
    description: z.string(),
  }),
});
```

### カスタムバリデーションの実装

Zodの`.refine()`を使うことで、複雑なバリデーションルールも実装できます：

```typescript
const textParamSchema = baseParamSchema
  .extend({
    type: z.literal("text"),
    value: z.object({
      text: z.string(),
    }),
  })
  .refine((data) => !data.required || data.value.text.length > 0, {
    message: "テキストを入力してください",
    path: ["value", "text"],
  });
```

## フォームの初期化

vee-validateの`useForm`を使ってフォームを初期化します。ZodスキーマはtoTypedSchemaでvee-validate用に変換します：

```typescript
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";

const { 
  handleSubmit, 
  values, 
  errors, 
  meta, 
  resetForm, 
  submitCount 
} = useForm({
  validationSchema: toTypedSchema(formSchema),
});
```

### vue-queryでデータ取得とフォーム初期値の設定

vue-queryを使ってサーバーからデータを取得し、フォームの初期値を設定します：

```typescript
import { useNestFormQuery } from "@/api/use-query/use-nest-form-query";

const id = computed(() => route.params.id as string);
const { data, isLoading } = useNestFormQuery(id);

// データ取得後にフォームをリセット
watch(data, (newData) => {
  if (!newData) return;
  resetForm({ values: newData });
});
```

## Fieldコンポーネントの使用

基本的なフィールドには、vee-validateの`Field`コンポーネントを使用します：

```vue
<Field v-slot="{ field, meta, errorMessage }" name="name">
  <div class="flex flex-col gap-2">
    <label :for="nameId">
      名前
      <span class="text-red-600 bg-red-100 px-1 py-0.5 rounded-md text-xs ml-1">
        必須
      </span>
    </label>
    <Input
      :id="nameId"
      :model-value="field.value"
      type="text"
      :aria-invalid="satisfiesErrorDisplayCondition(submitCount, meta) && !!errorMessage"
      @update:model-value="field.onChange"
      @blur="field.onBlur"
    />
    <p 
      v-if="satisfiesErrorDisplayCondition(submitCount, meta) && !!errorMessage" 
      class="text-sm text-red-600"
    >
      {{ errorMessage }}
    </p>
  </div>
</Field>
```

**ポイント:**
- `field.value`: 現在の値
- `field.onChange`: 値変更ハンドラー
- `field.onBlur`: blurイベントハンドラー
- `meta`: フィールドの状態（touched, dirty, valid等）
- `errorMessage`: バリデーションエラーメッセージ

## 配列フィールドの管理（useFieldArray）

動的に追加・削除可能なフィールド配列には`useFieldArray`を使用します：

```typescript
import { useFieldArray } from "vee-validate";

const {
  fields: conditionFields,
  remove: removeCondition,
  push: pushCondition,
} = useFieldArray<z.infer<typeof conditionSchema>>("conditions");

// 条件を追加
const addCondition = (): void => {
  pushCondition({
    params: [{
      type: "text" as const,
      value: { text: "" },
      required: true,
      readonly: { 
        title: "追加された条件のパラメータ", 
        description: "追加された条件のパラメータの説明" 
      },
    }],
    readonly: { 
      title: "追加された条件", 
      description: "追加された条件の説明" 
    },
  });
};
```

テンプレート側：

```vue
<div
  v-for="(condition, conditionIdx) in conditionFields"
  :key="condition.key"
  class="p-4 border border-gray-300 rounded"
>
  <div class="mb-2">
    <div class="font-bold">{{ condition.value.readonly.title }}</div>
    <div class="text-gray-500 text-sm">{{ condition.value.readonly.description }}</div>
  </div>

  <Button
    v-if="conditionFields.length > 1"
    type="button"
    variant="destructive"
    size="sm"
    @click="() => removeCondition(conditionIdx)"
  >
    条件を削除
  </Button>

  <ConditionalParams :index="conditionIdx" />
</div>
```

## カスタムコンポーネントでのuseField使用

vee-validateを組み込んだカスタムコンポーネントでは`useField`を使用します：

```typescript
// DateInputField.vue
import { useField, useFormContext } from "vee-validate";

const props = defineProps<{
  namePrefix: string;
  type: "date" | "month" | "year";
}>();

const { submitCount, errors } = useFormContext();

const yearField = useField<string>(`${props.namePrefix}.year`);
const monthField = useField<string>(`${props.namePrefix}.month`);
const dayField = useField<string>(`${props.namePrefix}.day`);

const rootErrorMessage = computed(() => errors.value[props.namePrefix]);
```

**useFieldの返り値:**
- `value`: フィールドの値
- `errorMessage`: エラーメッセージ
- `meta`: フィールドの状態
- `handleChange`: 値変更ハンドラー
- `handleBlur`: blurハンドラー

## アクセシビリティとユーザビリティを意識したエラー表示

エラーメッセージの表示タイミングは、ユーザー体験に大きく影響します。本実装では以下の条件を採用しています：

```typescript
// utils.ts
export const satisfiesErrorDisplayCondition = (
  submitCount: number, 
  meta: { touched: boolean; dirty: boolean }
) => {
  return submitCount > 0 || (meta.touched && meta.dirty);
};
```

**表示条件の詳細:**
1. **送信が1回以上試行された後（submitCount > 0）**: すべてのエラーを表示
2. **または、フィールドがタッチされて変更された場合（touched && dirty）**: 個別フィールドのエラーを表示

この条件により：
- ✅ 初期表示時にエラーが表示されず、ユーザーを威圧しない
- ✅ フィールドを触って変更した場合に即座にフィードバック
- ✅ 送信ボタンを押した後は、すべてのエラーを表示してユーザーに修正箇所を明示

### aria-invalid属性の活用

アクセシビリティ向上のため、`aria-invalid`属性を設定します：

```vue
<Input
  :aria-invalid="satisfiesErrorDisplayCondition(submitCount, meta) && !!errorMessage"
  @update:model-value="field.onChange"
  @blur="field.onBlur"
/>
```

これにより、スクリーンリーダーがエラー状態を適切に伝えられます。

## ネストされたフィールドのエラーハンドリング

日付入力のような複数フィールドからなるコンポーネントでは、個別のフィールドエラーとルート（全体）エラーを適切に表示する必要があります：

```typescript
const shouldShowRootError = computed(() => {
  // いずれかのフィールドにエラーがある場合、ルートエラーは表示しない
  const hasAnyFieldError = [
    !yearField.meta.valid, 
    !monthField.meta.valid, 
    !dayField.meta.valid
  ].some((hasError) => hasError);

  if (hasAnyFieldError) return false;

  // すべてのフィールドが有効で、かついずれかがエラー表示条件を満たし、
  // ルートエラーがある場合のみルートエラーを表示
  return (
    [yearField.meta, monthField.meta, dayField.meta].some((meta) =>
      satisfiesErrorDisplayCondition(submitCount.value, meta)
    ) && !!rootErrorMessage.value
  );
});
```

テンプレート：

```vue
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
```

## フォーム送信の処理

`handleSubmit`は成功時と失敗時のコールバックを受け取ります：

```typescript
const onSubmit = handleSubmit(
  (formValues) => {
    try {
      console.log("Form submitted:", formValues);
      // APIリクエストなどの処理
    } catch (error) {
      console.error("Form submission error:", error);
    }
  },
  (errors) => {
    console.error("Validation errors:", errors);
  }
);
```

```vue
<form @submit="onSubmit">
  <!-- フィールド -->
  <Button type="submit" class="mt-4">送信</Button>
</form>
```

## まとめ

vee-validateとZodを組み合わせることで、以下のメリットが得られます：

### 型安全性
- Zodスキーマから自動的にTypeScriptの型が推論される
- コンパイル時に型エラーを検出できる

### 保守性
- バリデーションロジックが一箇所に集約される
- スキーマの再利用が容易

### 開発者体験
- `Field`コンポーネントで簡潔な記述
- `useFieldArray`で動的フィールドを簡単に管理
- `useField`でカスタムコンポーネントへの統合が容易

### ユーザー体験
- 適切なタイミングでエラーを表示
- `aria-invalid`によるアクセシビリティ対応
- ネストされたフィールドでの直感的なエラー表示

本記事で紹介した実装パターンを活用することで、複雑なフォームでも型安全かつ保守性の高いコードを書くことができます。

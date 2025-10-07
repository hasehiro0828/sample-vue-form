import { formSchema } from "@/pages/NestForm/form-schema";
import z from "zod";

type Form = z.infer<typeof formSchema>;

const DUMMY_FORM_ARRAY: (Form & { id: string })[] = [
  {
    id: "1",
    name: "会員登録フォーム",
    description: "新規会員登録のための情報入力フォームです。必要な情報を入力してください。",
    conditions: [
      {
        title: "基本情報",
        description: "お客様の基本的な情報を入力してください",
        params: [
          {
            type: "text",
            value: { text: "山田太郎" },
            required: true,
            readonly: { title: "お名前", description: "フルネームを入力してください" },
          },
          {
            type: "text",
            value: { text: "yamada@example.com" },
            required: true,
            readonly: { title: "メールアドレス", description: "連絡可能なメールアドレスを入力してください" },
          },
          {
            type: "date",
            value: { year: 1990, month: 5, day: 15 },
            required: true,
            readonly: { title: "生年月日", description: "生年月日を入力してください" },
          },
        ],
      },
      {
        title: "契約情報",
        description: "契約に関する情報を入力してください",
        params: [
          {
            type: "month",
            value: { year: 2024, month: 4 },
            required: true,
            readonly: { title: "契約開始月", description: "契約を開始する年月を選択してください" },
          },
          {
            type: "text",
            value: { text: "スタンダードプラン" },
            required: true,
            readonly: { title: "プラン名", description: "ご希望のプラン名を入力してください" },
          },
        ],
      },
      {
        title: "オプション情報",
        description: "追加オプションがあれば入力してください",
        params: [
          {
            type: "text",
            value: { text: "" },
            required: false,
            readonly: { title: "紹介コード", description: "紹介コードをお持ちの場合は入力してください" },
          },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "イベント申し込みフォーム",
    description: "2024年秋季セミナーへの参加申し込みフォームです。",
    conditions: [
      {
        title: "参加者情報",
        description: "参加される方の情報を入力してください",
        params: [
          {
            type: "text",
            value: { text: "鈴木花子" },
            required: true,
            readonly: { title: "参加者名", description: "参加される方のお名前を入力してください" },
          },
          {
            type: "text",
            value: { text: "株式会社サンプル" },
            required: false,
            readonly: { title: "所属組織", description: "会社名や団体名を入力してください" },
          },
          {
            type: "date",
            value: { year: 2024, month: 11, day: 20 },
            required: true,
            readonly: { title: "参加希望日", description: "参加を希望する日付を選択してください" },
          },
        ],
      },
      {
        title: "特別要望",
        description: "特別な配慮が必要な場合は入力してください",
        params: [
          {
            type: "text",
            value: { text: "" },
            required: false,
            readonly: { title: "アレルギー情報", description: "食物アレルギーがある場合は記載してください" },
          },
          {
            type: "text",
            value: { text: "" },
            required: false,
            readonly: { title: "その他要望", description: "その他のご要望があれば記載してください" },
          },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "年次報告書提出フォーム",
    description: "2023年度の年次報告書を提出するためのフォームです。",
    conditions: [
      {
        title: "報告期間",
        description: "報告対象となる期間を指定してください",
        params: [
          {
            type: "year",
            value: { year: 2023 },
            required: true,
            readonly: { title: "報告年度", description: "報告対象の年度を選択してください" },
          },
          {
            type: "month",
            value: { year: 2024, month: 3 },
            required: true,
            readonly: { title: "提出期限", description: "報告書の提出期限を入力してください" },
          },
        ],
      },
      {
        title: "報告書情報",
        description: "提出する報告書の詳細情報",
        params: [
          {
            type: "text",
            value: { text: "2023年度 事業報告書" },
            required: true,
            readonly: { title: "報告書タイトル", description: "報告書のタイトルを入力してください" },
          },
          {
            type: "text",
            value: { text: "佐藤一郎" },
            required: true,
            readonly: { title: "作成者名", description: "報告書の作成者名を入力してください" },
          },
          {
            type: "date",
            value: { year: 2024, month: 3, day: 31 },
            required: true,
            readonly: { title: "作成日", description: "報告書の作成日を入力してください" },
          },
        ],
      },
    ],
  },
];

export const getNestForm = async (id: string) => {
  return DUMMY_FORM_ARRAY.find((form) => form.id === id);
};

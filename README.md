This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# コツァ'sブログアプリ

1.概要<br>
このアプリは記事を投稿、閲覧することができるブログアプリです。<br>
特に技術系の記事に向いていますがいろんなジャンルの記事を投稿することができます。<br>

2.開発の背景・経緯<br>
このアプリを開発しようと考えたきっかけは自分が普段記事を読んだりwebサービスを理由するなかで感じた不満を解決しようと考えたからです。<br>
詳しくは後の機能紹介や工夫点で書きますが、目安箱や記事の要約など私が普段から欲しいと考えていた機能を今回のアプリでは実装しました。<br>

3.公開URL<br>
<a href="https://next-blog-app-lake.vercel.app">https://next-blog-app-lake.vercel.app</a><br>

## 特徴と機能の説明

1.各ページについての説明<br>
- 閲覧用記事一覧ページ<br>
このページでは投稿記事が一覧で確認できます。<br>

- 記事詳細ページ<br>
このページでは記事の本文及び内容を楽しむことができます。<br>

- 管理投稿記事一覧ページ<br>
このページでは投稿記事の一覧に加えて、削除や編集ページへの遷移などもできます。<br>

- 投稿記事新規作成ページ<br>
このページでは新たに記事を作成することができます。<br>

- 記事編集ページ<br>
このページでは既存記事の編集をすることができます。<br>

- 管理カテゴリページ<br>
このページではカテゴリを一覧で確認することが可能で、直接削除や編集ページへの遷移が可能です。<br>

- カテゴリ新規作成ページ<br>
このページでは新たにカテゴリを作成することが可能です。<br>

- カテゴリ編集ページ<br>
このページでは既存のカテゴリの編集をすることができます。<br>

- 管理機能一覧ページ<br>
このページでは記事やカテゴリの新規作成、管理用一覧ページ、目安箱のページなど主要な管理用ページにURL入力不要で遷移することができます。<br>

- ヘッダー<br>
ヘッダーはどのページを閲覧していても利用したいページだと考えられる
サイトの説明ページやログインページ、トップページ(閲覧用記事一覧ページ)に遷移することができる。また、目安箱はこのサイトに対する感想や意見などをタイトルと本文に分けて書き、送信することができる。<br>
 感想、意見にも禁則ワードを指定することによって不適切な発言を防いだ。<br>

- サイト説明ページ<br>
このページはこのサイトや製作者である私について説明するページです。<br>
私の自己紹介やこのサイトの簡単な説明、私のXやgithubなどのリンクを記載しています。<br>

- 目安箱ページ<br>
目安箱ページでは送信された意見や感想を管理することができます。<br>

- ログインページ<br>
ログインページではメールアドレスとパスワードを用いてログイン、またはメールアドレスとパスワードを用いずにゲストログインを行うことができます<br>
ゲストログインの場合は編集や新規作成などの一部機能が使用できなくなります。<br>
<br>
2.機能、特徴についての説明<br>


## 使用技術 (技術スタック)

- 使用した言語やフレームワーク
    - 少なくとも TypeScript と Next.js、Prisma は書いておくべき。
    - その他、アプリを構成する主要なライブラリなどを記載する。
    - ReReact Hook Form や zod、SWR を使っている場合は明示する。
- 開発に使用したツールやウェブサービス
    - VSCode、Supabase、Vercel は書いておくべき。
- システム構成図

## 開発期間・体制

- 開発体制: 個人開発
- 開発期間: 2026.01.xx ~ 2026.02.xx (約XXX時間)

## 工夫した点・苦労した点

- 特に、技術的な目標や挑戦を持って取り組んだ場合は記載すると良いです。

## 既知の課題と今後の展望

- 改良・改善したいこと。
- 機能拡張のロードマップなど。

## 連絡先 (任意)

- 作品集としてのポートフォリオのURL
- SNSアカウント
- 所属など
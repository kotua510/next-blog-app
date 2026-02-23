"use client";
import Image from "next/image";

const Page: React.FC = () => {
  return (
  <main className="px-4 md:px-6">
    {/* ===== 概要（常に最上部） ===== */}
    <h1 className="mb-8 md:mb-10 text-center text-2xl font-bold">
      このサイトについての説明
    </h1>

    {/* 左寄せコンテンツ */}
    <div className="max-w-5xl mx-auto">
      {/* ===== 製作者エリア ===== */}
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        
        {/* ================= 作成者（スマホ2番目 / PC左） ================= */}
        <div className="order-2 md:order-1 flex flex-col items-start">
          <h2 className="mb-3 text-xl font-semibold">
            製作者ヾ(•ω•`)o : コツァ
          </h2>

          <Image
            src="/images/ava2.png"
            alt="製作者の画像"
            width={320}
            height={320}
            priority
            className="rounded-full border-4 border-slate-500 p-1.5 w-40 md:w-[320px]"
          />

          <p className="max-w-sm text-gray-700 leading-relaxed mt-3">
            このブログサイトを製作したコツァといいます。<br />
            主にゲームを中心としてプログラミングでいろいろ作っています。
          </p>
        </div>

        {/* ================= サイト説明（スマホ3番目 / PC右） ================= */}
        <div className="order-3 md:order-2 flex-1">
          <h3 className="mb-3 text-xl font-semibold">
            このブログサイトについて
          </h3>

          <p className="text-gray-700 leading-relaxed">
            本サイトはnext.js、TSなどを使用して作成されています。<br />
            本サイトでは記事の閲覧や作成などが行えます。閲覧数やいいねによる
            ランキングや記事作者による記事の要約機能があるので楽しんでください。
          </p>
        </div>
      </div>

      <div className="my-10" />

      {/* ================= リンク（スマホ4番目） ================= */}
      <h2 className="mb-3 text-xl font-semibold text-center">
        各種サイト🔗
      </h2>

      <div className="flex justify-center">
        <ul className="space-y-2 text-gray-700 text-left break-all">
          <li>
            X :
            <a
              href="https://x.com/kotua510"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:underline"
            >
              https://x.com/kotua510
            </a>
          </li>

          <li>
            GitHub :
            <a
              href="https://github.com/kotua510"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:underline"
            >
              https://github.com/kotua510
            </a>
          </li>

          <li>
            YouTube :
            <a
              href="https://www.youtube.com/@コツァ_lab"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:underline"
            >
              https://www.youtube.com/@コツァ_lab
            </a>
          </li>
        </ul>
      </div>
    </div>
  </main>
);
};

export default Page;

"use client";
import Image from "next/image";

const Page: React.FC = () => {
  return (
    <main className="px-6">
      {/* ページタイトル：中央 */}
      <h1 className="mb-10 text-center text-2xl font-bold">
        このサイトについての説明
      </h1>

      {/* 左寄せコンテンツ（幅を広めに） */}
      <div className="max-w-5xl">
        {/* 製作者エリア（2カラム） */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          {/* 左：製作者 */}
          <div className="flex flex-col items-start">
            <h2 className="mb-3 text-xl font-semibold">
              製作者 : コツァ
            </h2>

            <Image
              src="/images/ava2.png"
              alt="製作者の画像"
              width={320}
              height={320}
              priority
              className="rounded-full border-4 border-slate-500 p-1.5"
            />

            <p className="max-w-sm text-gray-700 leading-relaxed">
              このブログサイトを製作したコツァといいます。<br />
              主にゲームを中心としてプログラミングでいろいろ作っています。
            </p>
            <div className="my-6" />
          </div>

          

          {/* 右：説明（広く使う） */}
          <div className="flex-1">
            <h3 className="mb-3 text-lg font-semibold">
              このブログサイトについて
            </h3>

            <p className="text-gray-700 leading-relaxed">
              本サイトはnext.js、TSなどを使用して作成されています。<br />
              本サイトでは記事の閲覧や作成などが行えます。 閲覧数やいいねによる
              ランキングやAIによる記事の要約機能があるので楽しんでください。
            </p>
          </div>
        </div>

        <div className="my-10" />

        <h2 className="mb-3 text-xl font-semibold text-center">
  各種サイト
</h2>

<div className="flex justify-center">
  <ul className="space-y-2 text-gray-700 text-left">
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

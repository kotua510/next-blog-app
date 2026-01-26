"use client";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

const Page: React.FC = () => {
  return (
  <main className="flex flex-col items-center">
    <div className="py-10 pb-25 mb-10 text-5xl font-bold text-center">
      管理者用機能の一覧
    </div>

    <ul className="w-full max-w-3xl space-y-15 text-3xl">
      <li className="">
  <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
  投稿記事の一覧表示、編集、削除
  <br />
  <span className="ml-6">
    URL:
    <Link className="ml-2 text-blue-500 underline" href="/admin/posts">
      /admin/posts
    </Link>
  </span>
        </li>
        
        <li className="">
  <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
  投稿記事の新規作成
  <br />
  <span className="ml-6">
    URL:
    <Link className="ml-2 text-blue-500 underline" href="/admin/posts/new">
      /admin/posts/new
    </Link>
  </span>
        </li>
        
        <li className="">
  <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
  カテゴリの一覧表示、編集、削除
  <br />
  <span className="ml-6">
    URL:
    <Link className="ml-2 text-blue-500 underline" href="/admin/categories">
      /admin/categories
    </Link>
  </span>
        </li>
        
        <li className="">
  <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
  カテゴリの新規作成
  <br />
  <span className="ml-6">
    URL:
    <Link className="ml-2 text-blue-500 underline" href="/admin/categories/new">
      /admin/categories/new
    </Link>
  </span>
</li>
    </ul>
  </main>
);

};

export default Page;
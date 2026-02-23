"use client";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

const Page: React.FC = () => {
  return (
  <main className="flex flex-col items-center px-4">
    <div className="py-8 sm:py-10 mb-8 sm:mb-10 text-3xl sm:text-4xl md:text-5xl font-bold text-center">
      管理者用機能の一覧
    </div>

    <ul className="w-full max-w-3xl space-y-8 sm:space-y-12 md:space-y-15 text-lg sm:text-2xl md:text-3xl leading-relaxed">
      
      <li>
        <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
        投稿記事の一覧表示、編集、削除👀
        <br />
        <span className="ml-4 sm:ml-6 block">
          URL🔗:
          <Link className="ml-2 text-blue-500 underline break-all" href="/admin/posts">
            /admin/posts
          </Link>
        </span>
      </li>

      <li>
        <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
        投稿記事の新規作成✏️
        <br />
        <span className="ml-4 sm:ml-6 block">
          URL🔗:
          <Link className="ml-2 text-blue-500 underline break-all" href="/admin/posts/new">
            /admin/posts/new
          </Link>
        </span>
      </li>

      <li>
        <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
        カテゴリの一覧表示、編集、削除👀
        <br />
        <span className="ml-4 sm:ml-6 block">
          URL🔗:
          <Link className="ml-2 text-blue-500 underline break-all" href="/admin/categories">
            /admin/categories
          </Link>
        </span>
      </li>

      <li>
        <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
        カテゴリの新規作成✏️
        <br />
        <span className="ml-4 sm:ml-6 block">
          URL🔗:
          <Link className="ml-2 text-blue-500 underline break-all" href="/admin/categories/new">
            /admin/categories/new
          </Link>
        </span>
      </li>

      <li>
        <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
        目安箱🗳️
        <br />
        <span className="ml-4 sm:ml-6 block">
          URL🔗:
          <Link className="ml-2 text-blue-500 underline break-all" href="/admin/suggestion">
            /admin/suggestion
          </Link>
        </span>
      </li>

    </ul>
  </main>
);

};

export default Page;
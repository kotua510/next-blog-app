"use client";

import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFish, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/app/_hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SuggestionModal from "@/app/_components/SuggestionModal";

const Header: React.FC = () => {
  const router = useRouter();
  const { isLoading, session } = useAuth();

  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <header>
      <div className="bg-slate-800 py-2">
        <div
          className={twMerge(
            "mx-4 max-w-2xl md:mx-auto",
            "text-lg font-bold text-white"
          )}
        >
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
            <div className="sm:flex-1 text-center sm:text-left">
              <Link href="/">
                <FontAwesomeIcon icon={faFish} className="mr-1" />
                コツァ’s
                ブログ
              </Link>
            </div>

            <div className="sm:flex-1 text-center">
              {!isLoading &&
                (session ? (
                  <button onClick={logout} className="hover:underline">
                    Logout
                  </button>
                ) : (
                  <Link href="/login" className="hover:underline">
                    Login
                  </Link>
                ))}
            </div>

            <div className="sm:flex-1 text-center">
              <button
                onClick={() => setIsSuggestionOpen(true)}
                className="hover:underline"
              >
                目安箱
              </button>
            </div>

            <div className="sm:flex-1 text-center sm:text-right">
              <Link href="/about">このサイトについて</Link>
            </div>

            <div className="sm:flex-1 text-center sm:text-right relative">
              <button
                onClick={() => setIsMenuOpen((v) => !v)}
                className="hover:underline px-2"
              >
                <FontAwesomeIcon icon={faEllipsisVertical} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white text-black rounded shadow-lg z-50">
                  <Link
                    href="/"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    記事一覧
                  </Link>

                  <Link
                    href="/admin/posts"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    管理版記事一覧
                  </Link>

                  <Link
                    href="/admin/posts/new"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    記事新規作成
                  </Link>

                  <Link
                    href="/admin/categories"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    カテゴリ一覧
                  </Link>

                  <Link
                    href="/admin/categories/new"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    カテゴリ新規作成
                  </Link>

                  <Link
                    href="/admin"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    管理機能一覧
                  </Link>

                  <Link
                    href="/admin/suggestion"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    目安箱管理
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SuggestionModal
        isOpen={isSuggestionOpen}
        onClose={() => setIsSuggestionOpen(false)}
      />
    </header>
  );
};

export default Header;
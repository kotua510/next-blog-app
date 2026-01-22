"use client";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFish } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/utils/supabase"; // ◀ 追加
import { useAuth } from "@/app/_hooks/useAuth"; // ◀ 追加
import { useRouter } from "next/navigation"; // ◀ 追加
import { useState } from "react";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";


const Header: React.FC = () => {
  // ▼ 追加
  const router = useRouter();
  const { isLoading, session } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };
  // ▲ 追加

  return (
    <header>
  <div className="bg-slate-800 py-2">
    <div
      className={twMerge(
        "mx-4 max-w-2xl md:mx-auto",
        "flex items-center justify-between",
        "text-lg font-bold text-white"
      )}
    >
      {/* ===== 左：ロゴ ===== */}
      <Link href="/">
        <FontAwesomeIcon icon={faFish} className="mr-1" />
        コツァ’s ブログアプリ
      </Link>

      {/* ===== 右：三点リーダー ===== */}
      <div className="relative">
        {/* 三点ボタン */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="p-2 rounded hover:bg-slate-700"
          aria-label="menu"
        >
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </button>

        {/* メニュー */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-44 rounded-md bg-white text-black shadow-lg">
            <ul className="flex flex-col text-sm font-normal">
              {/* Login / Logout */}
              {!isLoading &&
                (session ? (
                  <li>
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </li>
                ) : (
                  <li>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Login
                    </Link>
                  </li>
                ))}

              {/* About */}
              <li>
                <Link
                  href="/about"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  このサイトについて
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  </div>
</header>


  );
};

export default Header;
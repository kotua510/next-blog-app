"use client";

import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFish } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/app/_hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Header: React.FC = () => {
  const router = useRouter();
  const { isLoading, session } = useAuth();

  // ✅ hydration 対策
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
            "flex items-center",
            "text-lg font-bold text-white"
          )}
        >
          {/* 基準コンテナ */}
          <div className="relative flex w-full items-center justify-between">
            {/* 左：ロゴ */}
            <div>
              <Link href="/">
                <FontAwesomeIcon icon={faFish} className="mr-1" />
                コツァ’s ブログアプリ
              </Link>
            </div>

            {/* 中央：Login / Logout */}
            <div className="absolute left-1/2 -translate-x-1/2">
              {!isLoading &&
                (session ? (
                  <button
                    onClick={logout}
                    className="hover:underline"
                  >
                    Logout
                  </button>
                ) : (
                  <Link href="/login" className="hover:underline">
                    Login
                  </Link>
                ))}
            </div>

            {/* 右：固定リンク */}
            <div className="flex gap-x-6">
              <Link href="/about">このサイトについて</Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

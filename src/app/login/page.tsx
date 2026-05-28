"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faKey, faUserSecret } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import ValidationAlert from "../_components/ValidationAlert";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

const Page: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loginError, setLoginError] = useState("");
  const router = useRouter();

  const updateEmailField = (value: string) => {
    setEmail(value);
    if (value.length > 0 && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("メールアドレスの形式で入力してください。");
      return;
    }
    setEmailError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoginError(
          `ログインIDまたはパスワードが違います（${error.code}）。`
        );
        return;
      }

      router.replace("/admin");
    } catch {
      setLoginError("ログイン処理中に予期せぬエラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsSubmitting(true);
    setLoginError("");

    try {
      const { error } = await supabase.auth.signInAnonymously();

      if (error) {
        setLoginError("ゲストログインに失敗しました。");
        return;
      }

      router.replace("/admin");
    } catch {
      setLoginError("ゲストログイン中にエラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <div className="mb-2 text-2xl font-bold">ログイン</div>
      <ValidationAlert msg={loginError} />

      <form
        onSubmit={handleSubmit}
        className={twMerge("mb-4 space-y-4", isSubmitting && "opacity-50")}
      >
        <div className="space-y-1">
          <label htmlFor="email" className="block font-bold">
            <FontAwesomeIcon icon={faEnvelope} className="mr-1" />
            ログインID（email）
          </label>
          <input
            type="text"
            className="w-full rounded-md border-2 px-2 py-1"
            placeholder="hoge@example.com"
            value={email}
            onChange={(e) => updateEmailField(e.target.value)}
            required
          />
          <ValidationAlert msg={emailError} />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block font-bold">
            <FontAwesomeIcon icon={faKey} className="mr-1" />
            パスワード
          </label>
          <input
            type="password"
            className="w-full rounded-md border-2 px-2 py-1"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-indigo-500 text-white hover:bg-indigo-600",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            disabled={
              isSubmitting ||
              emailError !== "" ||
              email.length === 0 ||
              password.length === 0
            }
          >
            ログイン
          </button>
        </div>
      </form>

      <div className="text-center">
        <button
          onClick={handleGuestLogin}
          disabled={isSubmitting}
          className="rounded-md px-5 py-1 font-bold bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faUserSecret} className="mr-2" />
          ゲストログイン
        </button>
      </div>
    </main>
  );
};

export default Page;

"use client";

import { ChangeEvent } from "react";
import { supabase } from "@/utils/supabase";
import CryptoJS from "crypto-js";
import { twMerge } from "tailwind-merge";

type Props = {
  onUploaded: (key: string) => void;
};

const bucketName = "cover-image";

const calculateMD5Hash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(buffer);
  return CryptoJS.MD5(wordArray).toString();
};

export const CoverImageUploader = ({ onUploaded }: Props) => {
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const hash = await calculateMD5Hash(file);
    const path = `private/${hash}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, { upsert: true });

    if (error || !data) {
      alert("アップロード失敗");
      return;
    }

    // 親に key を渡す
    onUploaded(data.path);
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      className={twMerge(
        "file:rounded file:px-2 file:py-1",
        "file:bg-blue-500 file:text-white hover:file:bg-blue-600",
        "file:cursor-pointer",
      )}
    />
  );
};

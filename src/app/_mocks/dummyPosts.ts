import type { Post } from "@/app/_types/Post";

const emptyImage = {
  url: "",
  height: 0,
  width: 0,
};

const dummyPosts: Post[] = [
  {
    id: "1d4cbd35-6ec2-4f34-b3e7-4a9b35a60d1a",
    createdAt: "2024-10-26T22:48:30.156Z",
    title: "投稿3",
    content:
      "秋は夕暮れ。<br/>夕日のさして山の端いと近うなりたるに、烏の寝どころへ行くとて、三つ四つ、二つ三つなど、飛びいそぐさへあはれなり。まいて雁などのつらねたるが、いと小さく見ゆるはいとをかし。<br/>日入りはてて、風の音、虫の 音など、はたいふべきにあらず。",

    coverImage: emptyImage,

    resultUrl: null,
    summary: null,
    comments: [],
    likes: [],
    likeCount: 0,
    commentCount: 0,
    viewCount: 0,

    categories: [
      {
        id: "587ac4ab-92de-450c-9423-5e091d16ecb5",
        name: "TypeScript",
        createdAt: "2024-10-26T22:48:30.156Z",
      },
      {
        id: "f8a4c465-2e7f-455d-aa1d-5098e9d0086d",
        name: "Next.js",
        createdAt: "2024-11-26T22:48:30.156Z",
      },
    ],
  },
];

export default dummyPosts;
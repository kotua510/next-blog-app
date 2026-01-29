import type { Category } from "./Category";
import type { CoverImage } from "./CoverImage";
import type { Comment } from "./Comment";
import type { PostLike } from "./PostLike"

export type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  categories: Category[];
  coverImage: CoverImage;
  comments: Comment[];
  likes: PostLike[];
};
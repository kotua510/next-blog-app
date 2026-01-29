import type { CommentLike } from "./CommentLike";

export type Comment = {
    id: string;
    postId: string;
    content: string;
    createAt: string;
    likes: CommentLike[];
}


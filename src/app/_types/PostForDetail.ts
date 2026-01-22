export type Category = {
  id: number;
  name: string;
};

export type PostForDetail = {
  id: string;
  title: string;
  content: string;
  coverImageKey: string | null;
  categories: Category[];
};
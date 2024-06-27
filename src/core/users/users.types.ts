import { PostWithTagsType } from '../posts/posts.types';

export type UserWithoutPasswordType = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date | null;
};

export type UserWithPostsType = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date | null;
  posts: PostWithTagsType;
};

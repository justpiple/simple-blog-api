import { Prisma } from '@prisma/client';

export const UserWithoutPassword: Prisma.UserSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  updatedAt: true,
};

export const PostWithTagsAndAuthor: Prisma.PostSelect = {
  id: true,
  author: { select: UserWithoutPassword },
  content: true,
  published: true,
  slug: true,
  tags: true,
  title: true,
  createdAt: true,
  updatedAt: true,
};

export const PostWithTags: Prisma.PostSelect = {
  id: true,
  content: true,
  published: true,
  slug: true,
  tags: true,
  title: true,
  createdAt: true,
  updatedAt: true,
};

export const UserWithPosts: Prisma.UserSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  posts: { select: PostWithTags },
};

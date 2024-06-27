import { Prisma } from '@prisma/client';
import { UserWithoutPasswordType } from '../users/users.types';

export type PostWithTagsType = {
  id: string;
  content: string;
  published: boolean;
  slug: string;
  tags: Prisma.TagGetPayload<{}>;
  title: string;
  createdAt: Date;
  updatedAt: Date | null;
};

export type Tags = {
  id: number;
  tagName: string;
};

export type PostWithTagsAndAuthorType = {
  id: string;
  content: string;
  published: boolean;
  slug: string;
  author: UserWithoutPasswordType;
  tags: Tags[];
  title: string;
  createdAt: Date;
  updatedAt: Date | null;
};

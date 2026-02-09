export interface Post {
  postId: number;
  userId: number;
  username: string;
  userProfilePicture: string | null;
  placeId?: number;
  title?: string;
  content: string;
  imageUrls: string[];
  likesCount: number;
  isLikedByCurrentUser?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostDto {
  title?: string;
  content: string;
  placeId?: number;
  images?: File[];
}

export interface PostResponse {
  success: boolean;
  message?: string;
  data: Post;
  timestamp: string;
}

export interface PostsListResponse {
  items: Post[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
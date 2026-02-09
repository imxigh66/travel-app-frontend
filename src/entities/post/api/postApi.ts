import axios from '../../../shared/api/axios'; // Ваш настроенный axios с токенами
import { Post, CreatePostDto, PostResponse, PostsListResponse } from '../model/post';

export const postApi = {
  // Создать пост
  createPost: async (data: CreatePostDto): Promise<Post> => {
    const formData = new FormData();
    
    if (data.title) formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.placeId) formData.append('placeId', data.placeId.toString());
    
    // Добавить несколько изображений
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await axios.post<PostResponse>('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  },

  // Получить посты текущего пользователя
  getMyPosts: async (pageNumber = 1, pageSize = 10): Promise<PostsListResponse> => {
    const response = await axios.get<PostsListResponse>('/posts/my-posts', {
      params: { pageNumber, pageSize },
    });
    return response.data;
  },

  // Получить все посты (лента)
  getAllPosts: async (pageNumber = 1, pageSize = 10): Promise<PostsListResponse> => {
    const response = await axios.get<PostsListResponse>('/posts', {
      params: { pageNumber, pageSize },
    });
    return response.data;
  },

  // Получить пост по ID
  getPostById: async (postId: number): Promise<Post> => {
    const response = await axios.get<PostResponse>(`/posts/${postId}`);
    return response.data.data;
  },

  // Лайкнуть пост
  likePost: async (postId: number): Promise<{ likesCount: number }> => {
    const response = await axios.post(`/posts/${postId}/like`);
    return response.data;
  },

  // Убрать лайк
  unlikePost: async (postId: number): Promise<{ likesCount: number }> => {
    const response = await axios.delete(`/posts/${postId}/like`);
    return response.data;
  },

  // Получить список пользователей, которые лайкнули
  getPostLikes: async (postId: number) => {
    const response = await axios.get(`/posts/${postId}/likes`);
    return response.data;
  },
};
import axios from '../../../shared/api/axios'; // Ваш настроенный axios с токенами
import { Post, CreatePostDto, PostResponse } from '../../../entities/post/model/post';

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
  }
};
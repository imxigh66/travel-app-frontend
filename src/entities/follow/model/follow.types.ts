export interface UserFollowDto {
  userId: number
  username: string
  name: string
  profilePicture?: string
  bio?: string
  isFollowing: boolean
}

export interface PaginatedFollowList {
  items: UserFollowDto[]
  totalCount: number
  pageNumber: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
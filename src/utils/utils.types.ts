export interface BaseResponseDTO {
  status: boolean;
  message: string;
  type?: 'array' | 'object';
  data?: any;
}

export interface AuthUser {
  id: string;
  role: string;
  email: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
}
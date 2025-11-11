export interface AppConfig {
  title: string;
  version: string;
  apiBaseUrl: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  status: number;
  success: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface LandingPageProps {
  title?: string;
  subtitle?: string;
}

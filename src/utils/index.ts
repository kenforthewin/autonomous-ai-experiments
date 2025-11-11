export const getConfig = (): {
  title: string;
  version: string;
  apiBaseUrl: string;
} => {
  return {
    title: import.meta.env.VITE_APP_TITLE || 'React Modern App',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    apiBaseUrl:
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  };
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

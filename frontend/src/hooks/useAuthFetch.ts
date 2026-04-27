import { useAuth } from "@clerk/react";

export function useAuthFetch() {
  const { getToken } = useAuth();

  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = await getToken();
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  };
}

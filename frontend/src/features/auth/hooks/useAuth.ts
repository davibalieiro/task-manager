import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import { useAuthContext } from "@/shared/context/AuthContext";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      email,
      password,
      name,
    }: {
      email: string;
      password: string;
      name: string;
    }) => authApi.register(email, password, name),
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.user);
    },
  });
}

export function useGoogleLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.googleLogin(),
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useCurrentUser() {
  const { user, loading } = useAuthContext();
  return useQuery({
    queryKey: ["user"],
    queryFn: () => authApi.me(),
    enabled: !loading && !!user,
    retry: false,
  });
}

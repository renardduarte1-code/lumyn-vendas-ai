import { useAuthStore } from '../state/authStore';

export async function signIn(email: string, password: string) {
  return useAuthStore.getState().signIn(email, password);
}

export async function signUp(email: string, password: string, fullName: string, companyName: string) {
  return useAuthStore.getState().signUp(email, password, fullName, companyName);
}

export async function signOut() {
  return useAuthStore.getState().signOut();
}

import { createClient } from "@supabase/supabase-js";
import { ref } from 'vue';
import type { Tables } from '@/types/supabase.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const auth = supabase.auth;

export const signUp = (email: string, password: string) =>
	supabase.auth.signUp({ email, password });

export const signInWithPassword = (email: string, password: string) =>
	supabase.auth.signInWithPassword({ email, password });

export const getUser = async () => {
	const { data, error } = await supabase.auth.getUser();
	return { user: data?.user ?? null, error };
};

export const updateUser = (attributes: { email?: string; password?: string; data?: Record<string, unknown> }) =>
	supabase.auth.updateUser(attributes);

export const signOut = () => supabase.auth.signOut();

// Reactive current user for components that expect a reactive store
export const currentUser = ref<any | null>(null);

// Initialize currentUser and subscribe to auth changes
(async () => {
	try {
		const { data } = await supabase.auth.getUser();
		currentUser.value = data?.user ?? null;
	} catch (e) {
		currentUser.value = null;
	}
})();

supabase.auth.onAuthStateChange((_, session) => {
	currentUser.value = (session as any)?.user ?? null;
});

// Strongly typed row exports
export type TransactionRow = Tables<'transactions'>;
export type CategoryRow = Tables<'categories'>;
export type ProfileRow = Tables<'profiles'>;

export type Transaction = TransactionRow & { expand?: { category?: CategoryRow | null } };
export type Category = CategoryRow;
export type Profile = ProfileRow;
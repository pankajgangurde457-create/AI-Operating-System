'use server'

import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  // Mock login for frontend-only mode
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  // Mock signup for frontend-only mode
  redirect('/dashboard')
}

export async function logout() {
  // Mock logout for frontend-only mode
  redirect('/login')
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
  })
}

export const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

// Function to generate ID from heading text
export const generateHeadingId = (text: string) => {
  return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
}

export const changeUrl = (url: string) => {
  window.history.replaceState(null, "", url);
};

export async function loadJson(name: string) {
  // Use absolute URL to avoid i18n middleware prefix
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const request = await fetch(`${baseUrl}/jsons/${name}.json`);
  const data = await request.json();
  return data;
}
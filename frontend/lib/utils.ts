export const getImageUrl = (url: string | undefined | null) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace('/api', '');
  return `${baseUrl}${url}`;
};

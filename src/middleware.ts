export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/onboarding/:path*', '/dashboard/:path*', '/chat/:path*'],
};

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { languagesList } from './i18n/config';
import api from './lib/api_routes';

const i18nMiddleware = createMiddleware(routing);

const isPublicApiRoute = createRouteMatcher([
  '/api/webhooks/clerk'
]);

const isApiRoute = createRouteMatcher(['/api/(.*)']);
const isSSOCallback = createRouteMatcher([`/${languagesList}/auth/sso-callback(.*)`]);
const isAppRoute = createRouteMatcher([`/${languagesList}/app(.*)`]);
const isAccountRoute = createRouteMatcher([`/${languagesList}/account(.*)`]);
const isAdminRoute = createRouteMatcher([`/${languagesList}/admin(.*)`]);
const isTestingRoute = createRouteMatcher([`/${languagesList}/testing(.*)`]);

export default clerkMiddleware(async (auth, req) => {
  if (isApiRoute(req)) {  
    if (!isPublicApiRoute(req)) {
      auth.protect();
    }
  } else {
    if (isSSOCallback(req)) {
      return i18nMiddleware(req);
    }

    if (isAccountRoute(req) || isAppRoute(req)) {
        await auth.protect()
      }
      
    if (isAdminRoute(req) || isTestingRoute(req)) {
        await auth.protect((has) => {
          return has({ permission: 'org:admin' }) || has({ role: 'admin' })
        })
    }
    
    return i18nMiddleware(req);
  }
},
{
    signInUrl: '/login'
});


export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json|glb|gltf|fbx|obj|dae|3ds|blend|apng)).*)',
    '/(api|trpc)(.*)',
  ],
};

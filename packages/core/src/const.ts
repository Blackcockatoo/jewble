export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Default values for React Native/non-Vite environments
export const APP_TITLE = "Meta-Pet";

export const APP_LOGO = "https://placehold.co/128x128/E1E7EF/1F2937?text=App";

// Generate login URL at runtime so redirect URI reflects the current origin.
// Note: This function is only for web environments and won't work in React Native
export const getLoginUrl = () => {
  if (typeof window === 'undefined') {
    console.warn('getLoginUrl is only available in browser environment');
    return '';
  }

  // These would normally come from import.meta.env in Vite
  // For now, using empty strings as placeholders for mobile compatibility
  const oauthPortalUrl = process.env.VITE_OAUTH_PORTAL_URL || '';
  const appId = process.env.VITE_APP_ID || '';

  if (!oauthPortalUrl || !appId) {
    console.warn('OAuth configuration not available');
    return '';
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

export const SITE_URL = "https://thegranule.org";
export const SITE_NAME = "The Granule Africa";
export const TWITTER_HANDLE = "@thegranuleafrica"; // TODO: update once the handle is created

export function absoluteUrl(pathOrUrl: string): string {
  return pathOrUrl.startsWith("http") ? pathOrUrl : `${SITE_URL}${pathOrUrl}`;
}

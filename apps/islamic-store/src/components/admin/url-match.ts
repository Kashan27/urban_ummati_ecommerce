export function pathnameMatchesHref(pathname: string, href: string): boolean {
  const base = href.split(/[?#]/)[0];
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** Next.js pathname + raw search string (without leading ?), e.g. `status=received` */
export function hrefMatchesLocation(href: string, pathname: string, searchWithoutQuestion: string): boolean {
  const [pathPart, queryPart] = href.split("?");
  const hashIdx = pathPart.indexOf("#");
  const pathOnly = hashIdx >= 0 ? pathPart.slice(0, hashIdx) : pathPart;

  if (pathname !== pathOnly) return false;

  if (!queryPart) {
    return searchWithoutQuestion === "";
  }

  const want = new URLSearchParams(queryPart);
  const have = new URLSearchParams(searchWithoutQuestion);
  return want.toString() === have.toString();
}

export function getPublicUrl(request: Request, path: string): URL {
  const url = new URL(request.url);
  const target = new URL(path, url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedHost) {
    url.host = forwardedHost.split(",")[0].trim();
  }
  if (forwardedProto) {
    url.protocol = `${forwardedProto.split(",")[0].trim()}:`;
  }

  url.pathname = target.pathname;
  url.search = target.search;
  return url;
}

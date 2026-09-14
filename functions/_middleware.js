// Pages middleware is the sole www redirect mechanism; _routes.json keeps static assets out of this path.
export function onRequest(context) {
  const url=new URL(context.request.url);
  if(url.hostname==='www.storagebuddyth.com'){
    return Response.redirect(`https://storagebuddyth.com${url.pathname}${url.search}`,301);
  }
  return context.next();
}

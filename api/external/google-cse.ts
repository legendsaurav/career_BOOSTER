import { handleGoogleCseProxy } from '../_lib/googleCseProxy';

export default async function handler(req: any, res: any) {
  return handleGoogleCseProxy(req, res);
}

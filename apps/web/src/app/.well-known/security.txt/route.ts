import { GET as securityHandler } from '../../security.txt/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return securityHandler();
}

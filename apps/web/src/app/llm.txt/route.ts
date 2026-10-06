import { GET as llmsHandler } from '../llms.txt/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return llmsHandler();
}

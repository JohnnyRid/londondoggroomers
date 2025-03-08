import type { _NextRequest } from 'next/server';

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export interface PageProps {
  params: Params;
  searchParams: SearchParams;
}

export interface Params {
  slug?: string;
}
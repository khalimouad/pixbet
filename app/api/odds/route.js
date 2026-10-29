import { unstable_cache } from 'next/cache';
import { normalizeEvents } from '../../../lib/odds.mjs';
export const runtime = 'nodejs';
const SIX_HOURS = 21600;
// One fixed region and market: callers cannot expand upstream credit usage.
const readOdds = unstable_cache(async () => {
 try {
  const url = new URL('https://api.the-odds-api.com/v4/sports/upcoming/odds/');
  url.search = new URLSearchParams({apiKey:process.env.ODDS_API_KEY,regions:'eu',markets:'h2h',oddsFormat:'decimal',dateFormat:'iso'}).toString();
  const response = await fetch(url, {cache:'no-store',signal:AbortSignal.timeout(12000)});
  // Never return the provider's body or URL on errors: both can contain secrets.
  if (!response.ok) return {events:[],error:response.status===401||response.status===403?'provider_auth':response.status===429?'provider_limit':'provider_unavailable'};
  const events = normalizeEvents(await response.json());
  return {events,fetchedAt:new Date().toISOString(),region:'eu',cacheSeconds:SIX_HOURS,source:'The Odds API'};
 } catch { return {events:[],error:'provider_unavailable'}; }
}, ['pixbet-upcoming-eu-h2h-v1'], {revalidate:SIX_HOURS});
export async function GET() {
 if (!process.env.ODDS_API_KEY) return Response.json({events:[],error:'not_configured'},{status:503});
 const result = await readOdds();
 return Response.json(result,{status:result.error?503:200,headers:{'Cache-Control':result.error?'public, s-maxage=300':'public, s-maxage=21600, stale-while-revalidate=60'}});
}


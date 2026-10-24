import {games} from '../../../lib/catalogue.mjs';
export async function GET() {
 return Response.json({games:games.map(g=>({...g,mode:'demo',realMoneyEnabled:false})),providers:[...new Set(games.map(g=>g.provider))],mode:'demo'},{headers:{'Cache-Control':'public, s-maxage=3600'}});
}

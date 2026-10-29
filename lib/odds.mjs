export function normalizeEvents(events) {
 if (!Array.isArray(events)) throw new Error('Invalid odds response');
 return events.flatMap(event => {
  if (!event || typeof event.id !== 'string' || typeof event.home_team !== 'string' || typeof event.away_team !== 'string' || !Number.isFinite(Date.parse(event.commence_time))) return [];
  const source = (Array.isArray(event.bookmakers) ? event.bookmakers : []).map(bookmaker => ({bookmaker, market: bookmaker.markets?.find(m => m.key === 'h2h')})).find(({market}) => {
   const outcomes = Array.isArray(market?.outcomes) ? market.outcomes : [];
   return [event.home_team, event.away_team].every(name => outcomes.some(o => o.name === name && Number.isFinite(o.price) && o.price > 1));
  });
  if (!source) return [];
  const {bookmaker,market} = source;
  const options = [{name:event.home_team,label:'1'},{name:'Draw',label:'X'},{name:event.away_team,label:'2'}].flatMap(({name,label}) => {
   const outcome = market.outcomes.find(o => o.name === name && Number.isFinite(o.price) && o.price > 1);
   return outcome ? [{name,label,price:outcome.price}] : [];
  });
  return [{id:event.id, sport:event.sport_title || event.sport_key, startTime:event.commence_time, home:event.home_team, away:event.away_team, bookmaker:bookmaker.title || bookmaker.key, updatedAt:market.last_update || bookmaker.last_update || null, outcomes:options}];
 }).sort((a,b) => Date.parse(a.startTime)-Date.parse(b.startTime));
}


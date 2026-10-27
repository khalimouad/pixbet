import {unstable_cache} from 'next/cache';
import {bigBangClient} from './bigbang.mjs';
export const readBigBangCatalogue=unstable_cache(()=>bigBangClient.catalogue(),['pixbet-bigbang-standard-catalogue-v1'],{revalidate:900});

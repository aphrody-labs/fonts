Contents:

* families.csv - expressive and typographic tags, human assessed
* quant.csv - measured values, machine assessed
* skip.csv - signals to machine assessors, formulated as tags, human assessed

Tooling (Bun):

* stats.ts - basic stats about tags: `bun stats.ts`
* lowtags.ts - families with fewer than the median # tags: `bun lowtags.ts [cutoff]`
* tags.test.ts - `bun test`

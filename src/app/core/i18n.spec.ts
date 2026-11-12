import en from '../../i18n/en.json';
import ml from '../../i18n/ml.json';
import ta from '../../i18n/ta.json';
import { CATALOG, PRODUCT_CATEGORIES, PRODUCT_GROUPS } from './company.config';
import { TRAININGS } from './trainings.config';

type Tree = { [k: string]: unknown };

/** Flattens to "a.b.c" keys; arrays count as one value (with their length). */
const flatten = (o: Tree, prefix = '', out = new Map<string, unknown>()) => {
  for (const [k, v] of Object.entries(o)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v as Tree, key, out);
    else out.set(key, v);
  }
  return out;
};
const params = (v: unknown) => (typeof v === 'string' ? (v.match(/{{\s*\w+\s*}}/g) ?? []).sort().join() : '');

describe('Translations', () => {
  const EN = flatten(en as Tree);
  for (const [name, file] of [['Malayalam', ml], ['Tamil', ta]] as const) {
    it(`${name} has exactly the English keys, placeholders and list lengths`, () => {
      const other = flatten(file as Tree);
      expect([...other.keys()].sort()).toEqual([...EN.keys()].sort());
      for (const [k, v] of EN) {
        const o = other.get(k);
        expect(params(o)).withContext(k).toBe(params(v));
        if (Array.isArray(v)) expect((o as unknown[]).length).withContext(k).toBe(v.length);
        expect(typeof o === 'string' ? o.trim() : 'x').withContext(k).not.toBe('');
      }
    });
  }

  it('names every product group, category and training programme', () => {
    for (const g of PRODUCT_GROUPS) expect(EN.has(`products.groups.${g.id}`)).withContext(g.id).toBeTrue();
    for (const c of PRODUCT_CATEGORIES) {
      expect(EN.has(`products.categories.${c.slug}.name`)).withContext(c.slug).toBeTrue();
      expect(EN.has(`products.categories.${c.slug}.short`)).withContext(c.slug).toBeTrue();
    }
    for (const t of TRAININGS) expect(EN.has(`trainings.programmes.${t.key}.title`)).withContext(t.key).toBeTrue();
  });

  it('only translates products that exist in the catalogue', () => {
    const known = new Set(Object.entries(CATALOG).flatMap(([s, items]) => items.map((i) => `products.items.${s}.${i.id}`)));
    for (const k of EN.keys()) if (k.startsWith('products.items.')) expect(known.has(k)).withContext(k).toBeTrue();
  });
});

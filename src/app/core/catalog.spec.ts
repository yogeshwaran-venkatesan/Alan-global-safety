import { CATALOG, DETAIL_PRODUCTS, PRODUCT_CATEGORIES, PRODUCT_COUNT, PRODUCT_GROUPS } from './company.config';
import { TRAININGS } from './trainings.config';

describe('Product catalogue (from the brochure)', () => {
  it('has a category for every brochure section and the other way round', () => {
    const slugs = PRODUCT_CATEGORIES.map((c) => c.slug).sort();
    expect(Object.keys(CATALOG).sort()).toEqual(slugs);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('puts every category in a known group, with at least one product', () => {
    const groups = new Set(PRODUCT_GROUPS.map((g) => g.id));
    for (const c of PRODUCT_CATEGORIES) {
      expect(groups.has(c.group)).withContext(c.slug).toBeTrue();
      expect(CATALOG[c.slug].length).withContext(c.slug).toBeGreaterThan(0);
    }
  });

  it('uses one of the section’s own products as its cover photo (or none while photos are pending)', () => {
    for (const c of PRODUCT_CATEGORIES) {
      if (!c.image) expect(CATALOG[c.slug].every((i) => !i.img)).withContext(c.slug).toBeTrue();
      else expect(CATALOG[c.slug].some((i) => i.img === c.image)).withContext(c.slug).toBeTrue();
    }
  });

  it('gives every product a unique id, a name and a photo in its section folder', () => {
    expect(PRODUCT_COUNT).toBe(298 + 17 + 2);
    for (const [slug, items] of Object.entries(CATALOG)) {
      const ids = items.map((i) => i.id);
      expect(new Set(ids).size).withContext(slug).toBe(ids.length);
      for (const i of items) {
        expect(i.label.trim()).withContext(i.id).not.toBe('');
        if (i.img) expect(i.img).toBe(`images/catalog/${slug}/${i.id}.webp`);
        else expect(i.detail).withContext(i.id + ' has no photo, so it must have a datasheet page').toBeTrue();
        expect(i.w).toBeGreaterThan(0);
      }
    }
  });

  it('lists 19 products with their own datasheet page', () => {
    expect(DETAIL_PRODUCTS.length).toBe(19);
  });

  it('has 25 training programmes with unique keys', () => {
    expect(TRAININGS.length).toBe(25);
    expect(new Set(TRAININGS.map((t) => t.key)).size).toBe(25);
  });
});

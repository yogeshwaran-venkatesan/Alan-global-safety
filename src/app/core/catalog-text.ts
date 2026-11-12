import { TranslateService } from '@ngx-translate/core';
import { CatalogItem } from './catalog.data';

/** i18n key for a product's translated descriptive name. */
export const itemKey = (section: string, id: string) => `products.items.${section}.${id}`;

/**
 * A product's name in the current language: the translated descriptive name when
 * one exists, otherwise the name exactly as printed in the brochure.
 */
export const itemName = (t: TranslateService, section: string, item: CatalogItem): string => {
  const key = itemKey(section, item.id);
  const v = t.instant(key);
  return typeof v === 'string' && v !== key ? v : item.label;
};

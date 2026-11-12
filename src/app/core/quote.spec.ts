import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { categoryLineId, itemLineId, QuoteService, trainingLineId } from './quote';

describe('QuoteService', () => {
  let quote: QuoteService;

  beforeEach(() => {
    localStorage.removeItem('ags.quote.v2');
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    quote = TestBed.inject(QuoteService);
  });

  it('adds each line once and toggles it off again', () => {
    const line = { id: itemLineId('first-aid', 'fire-blanket'), kind: 'item' as const, ref: 'first-aid', itemId: 'fire-blanket' };
    expect(quote.toggle(line)).toBeTrue();
    quote.add(line);
    expect(quote.count()).toBe(1);
    expect(quote.lines()[0].qty).toBe(1);
    expect(quote.toggle(line)).toBeFalse();
    expect(quote.count()).toBe(0);
  });

  it('keeps quantities between 1 and 9999', () => {
    quote.add({ id: categoryLineId('head-protection'), kind: 'category', ref: 'head-protection' });
    const id = categoryLineId('head-protection');
    quote.setQty(id, 0);
    expect(quote.lines()[0].qty).toBe(1);
    quote.setQty(id, 25000);
    expect(quote.lines()[0].qty).toBe(9999);
    quote.setQty(id, 12.6);
    expect(quote.lines()[0].qty).toBe(13);
  });

  it('saves the list in this browser', () => {
    quote.add({ id: trainingLineId('atp3'), kind: 'training', ref: 'atp3' });
    TestBed.tick();
    const saved = JSON.parse(localStorage.getItem('ags.quote.v2') ?? '[]');
    expect(saved.map((l: { id: string }) => l.id)).toEqual(['t:atp3']);
  });
});

import { describe, it, expect } from 'vitest';
import * as main from '../src';
import * as react from '../src/react';

describe('exports', () => {
  it('main exports are present', () => {
    expect(main).toBeTruthy();
  });

  it('react exports are present', () => {
    expect(react).toBeTruthy();
  });
});

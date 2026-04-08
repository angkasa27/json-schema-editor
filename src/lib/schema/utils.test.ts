import { expect, test, describe } from 'vitest';
import { inferSchema, parseJsonStr } from './utils';

describe('inferSchema', () => {
  test('infers primitive types correctly', () => {
    expect(inferSchema("test")).toEqual({ type: 'string' });
    expect(inferSchema(42)).toEqual({ type: 'number' });
    expect(inferSchema(true)).toEqual({ type: 'boolean' });
    expect(inferSchema(null)).toEqual({ type: 'null' });
  });

  test('infers object types correctly', () => {
    const data = { age: 25, active: true };
    const schema = inferSchema(data);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        age: { type: 'number' },
        active: { type: 'boolean' }
      },
      required: ['age', 'active']
    });
  });

  test('infers array types correctly', () => {
    const data = [1, 2, 3];
    const schema = inferSchema(data);
    expect(schema).toEqual({
      type: 'array',
      items: { type: 'number' }
    });
  });

  test('infers nested object and arrays correctly', () => {
    const data = { team: [{ name: "Alice" }] };
    expect(inferSchema(data)).toEqual({
      type: 'object',
      properties: {
        team: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' }
            },
            required: ['name']
          }
        }
      },
      required: ['team']
    });
  });
});

describe('parseJsonStr', () => {
  test('parses valid json object string', () => {
    expect(parseJsonStr('{"a": 1}')).toEqual({ a: 1 });
  });

  test('returns undefined for invalid json', () => {
    expect(parseJsonStr('{a: 1}')).toBeUndefined();
    expect(parseJsonStr('just a string')).toBeUndefined();
  });
});

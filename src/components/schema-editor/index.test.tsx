import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import JsonSchemaEditor from './index';

// Because we're using ResizeObserver in some UI components, we need a standard mock
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Polyfill innerText for JSDOM
if (!Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'innerText')) {
  Object.defineProperty(HTMLElement.prototype, 'innerText', {
    get() { return this.textContent; },
    set(v) { this.textContent = v; }
  });
}

describe('JsonSchemaEditor', () => {
  test('calls onSchemaChange when initialized', async () => {
    const handleChange = vi.fn();
    const data = {
      type: "object" as const,
      properties: {
        field: { type: "string" as const }
      }
    };
    
    render(<JsonSchemaEditor data={data} onSchemaChange={handleChange} />);
    
    await waitFor(() => {
      expect(handleChange).toHaveBeenCalled();
    });
    
    // After initialization, it should pass back the schema
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      type: "object"
    }));
  });

  test('renders the base configuration natively', async () => {
    const data = {
      type: "object" as const,
      properties: {
        hello_world: { type: "string" as const }
      }
    };
    
    render(<JsonSchemaEditor data={data} />);
    
    // We expect the word 'object' and `string` to be accessible 
    // depending on exactly how Select elements are mocked vs real.
    await waitFor(() => {
      // Inputs bind names 
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.some(input => (input as HTMLInputElement).value === 'hello_world')).toBeTruthy();
    });
  });
});

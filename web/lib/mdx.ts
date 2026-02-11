import { compile, run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import type { ComponentType } from 'react';

export async function getMdxComponent(source: string): Promise<ComponentType> {
  const compiled = await compile(source, {
    outputFormat: 'function-body'
  });

  const mod = await run(String(compiled), {
    ...runtime,
    baseUrl: import.meta.url
  });

  return mod.default as ComponentType;
}

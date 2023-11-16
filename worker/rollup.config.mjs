import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'dist/esm/sqlite-worker.js',
    output: {
      dir: 'dist/bundle',
      format: 'esm',
      exports: 'auto',
      compact: true,
    },
    plugins: [
      json(),
      nodeResolve({
        preferBuiltins: true,
      }),
    ]
  }
];

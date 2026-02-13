import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: './dist/index.js',
    output: [
      {
        file: './dist/index.cjs.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: './dist/index.mjs',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      terser()
    ]
  },
  {
    input: './dist/index.d.ts',
    output: {
      file: './dist/index.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  }
];

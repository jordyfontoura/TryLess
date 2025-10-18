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
        file: './dist/index.esm.js',
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
    input: './dist/register.js',
    output: [
      {
        file: './dist/register.cjs.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: './dist/register.esm.js',
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
  },
  {
    input: './dist/register.d.ts',
    output: {
      file: './dist/register.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  }
];

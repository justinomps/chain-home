import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'index.js',
  output: {
    file: 'dist/chain-home-radar.js',
    format: 'iife',
    name: 'ChainHomeRadar'
  },
  plugins: [
    resolve(),
    babel({
      babelHelpers: 'runtime',
      presets: ['@babel/preset-react'],
      plugins: ['@babel/plugin-transform-runtime']
    }),
    terser()
  ]
};

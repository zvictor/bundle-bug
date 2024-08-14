import * as esbuild from 'esbuild'
// import tscPlugin from 'esbuild-plugin-tsc'

esbuild.build({
  entryPoints: ['server/server.ts'],
  bundle: true,
  outfile: 'dist/index.mjs',
  // plugins: [tscPlugin({ force: true })],
  // external: ['uuidv7', 'isows'],
  format: 'esm',
  minifyWhitespace: true,
  minifySyntax: true,
})

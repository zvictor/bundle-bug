import * as esbuild from 'esbuild';
import * as path from 'path';
import * as fs from 'fs';

interface WorkerProperties {
  accountID: string;
  scriptName: string;
  build: NodeProperties;
}

interface NodeProperties {
  loader: { [key: string]: string };
  splitting: boolean;
  minify: boolean;
}

export interface BuildInput {
  warp: {
    properties: string;
    handler: string;
    functionID: string;
  };
  project: {
    pathRoot: () => string;
  };
  out: () => string;
}

interface BuildOutput {
  handler: string;
  errors: string[];
}

interface RunInput {
  // Define the properties of RunInput
}

interface Worker {
  // Define the properties of Worker
}

class WorkerRuntime {
  private contexts: Map<string, esbuild.BuildContext>;
  private results: Map<string, esbuild.BuildResult>;

  constructor() {
    this.contexts = new Map();
    this.results = new Map();
  }

  async build(ctx: any, input: BuildInput): Promise<BuildOutput> {
    const properties: WorkerProperties = JSON.parse(input.warp.properties);
    const build = properties.build;

    const abs = path.resolve(input.warp.handler);
    const target = path.join(input.out(), input.warp.handler);

    console.log('loader info', { loader: build.loader });

    const loader: { [key: string]: esbuild.Loader } = {};
    const loaderMap: { [key: string]: esbuild.Loader } = {
      js: 'js',
      jsx: 'jsx',
      ts: 'ts',
      tsx: 'tsx',
      css: 'css',
      json: 'json',
      text: 'text',
      base64: 'base64',
      file: 'file',
      dataurl: 'dataurl',
      binary: 'binary',
    };

    for (const [key, value] of Object.entries(build.loader)) {
      const mapped = loaderMap[value];
      if (mapped) {
        loader[key] = mapped;
      }
    }

    const options: esbuild.BuildOptions = {
      platform: 'node',
      stdin: {
        contents: `
        import handler from "${abs}"
        import { fromCloudflareEnv, wrapCloudflareHandler } from "sst"
        export default wrapCloudflareHandler(handler)
        `,
        resolveDir: path.dirname(abs),
        loader: 'ts',
      },
      external: ['node:*', 'cloudflare:workers'],
      conditions: ['worker'],
      sourcemap: false,
      loader: loader,
      keepNames: true,
      bundle: true,
      splitting: build.splitting,
      metafile: true,
      write: true,
      plugins: [
        {
          name: 'node-prefix',
          setup(build: esbuild.PluginBuild) {
            build.onResolve({ filter: /.*/ }, (args: esbuild.OnResolveArgs) => {
              if (NODE_BUILTINS[args.path]) {
                return {
                  path: 'node:' + args.path,
                  external: true,
                };
              }
              return null;
            });
          },
        },
      ],
      outfile: target,
      minifyWhitespace: build.minify,
      minifySyntax: build.minify,
      minifyIdentifiers: build.minify,
      target: 'esnext',
      format: 'esm',
      mainFields: ['module', 'main'],
    };

    let buildContext = this.contexts.get(input.warp.functionID);
    if (!buildContext) {
      buildContext = await esbuild.context(options);
      this.contexts.set(input.warp.functionID, buildContext);
    }

    const result = await buildContext.rebuild();
    if (result.errors.length === 0) {
      this.results.set(input.warp.functionID, result);
    }

    const errors = result.errors.map(error => error.text);

    result.errors.forEach(error => console.error('esbuild error', { error }));
    result.warnings.forEach(warning => console.warn('esbuild warning', { warning }));

    return {
      handler: input.warp.handler,
      errors: errors,
    };
  }

  match(runtime: string): boolean {
    return runtime === 'worker';
  }

  getFile(input: BuildInput): [string, boolean] {
    const dir = path.dirname(input.warp.handler);
    const base = path.basename(input.warp.handler).split('.')[0];
    for (const ext of NODE_EXTENSIONS) {
      const file = path.join(input.project.pathRoot(), dir, base + ext);
      if (fs.existsSync(file)) {
        return [file, true];
      }
    }
    return ['', false];
  }

  shouldRebuild(functionID: string, file: string): boolean {
    const result = this.results.get(functionID);
    if (!result) {
      return false;
    }

    const meta = JSON.parse(result.metafile);
    for (const key in meta.inputs) {
      const absPath = path.resolve(key);
      if (absPath === file) {
        return true;
      }
    }

    return false;
  }

  run(ctx: any, input: RunInput): Worker {
    throw new Error('Not implemented');
  }
}

const NODE_BUILTINS: { [key: string]: boolean } = {
  assert: true,
  async_hooks: true,
  buffer: true,
  child_process: true,
  cluster: true,
  console: true,
  constants: true,
  crypto: true,
  dgram: true,
  diagnostics_channel: true,
  dns: true,
  domain: true,
  events: true,
  fs: true,
  http: true,
  http2: true,
  https: true,
  inspector: true,
  module: true,
  net: true,
  os: true,
  path: true,
  perf_hooks: true,
  process: true,
  punycode: true,
  querystring: true,
  readline: true,
  repl: true,
  stream: true,
  string_decoder: true,
  sys: true,
  timers: true,
  tls: true,
  trace_events: true,
  tty: true,
  url: true,
  util: true,
  v8: true,
  vm: true,
  wasi: true,
  worker_threads: true,
  zlib: true,
};

const NODE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx'];

export { WorkerRuntime };
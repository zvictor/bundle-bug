import path from 'node:path';
import { WorkerRuntime ,BuildInput} from './esbuild.sst'

const buildInput: BuildInput = {
  warp: {
    properties: JSON.stringify({
      accountID: "your-account-id",  
      scriptName: "server",
      build: {
        loader: {
          ".ts": "ts",
          ".js": "js"
        },
        splitting: false,
        minify: false,
        external: ['uuidv7', 'isows'],
      }
    }),
    handler: "./server/server.ts",
    functionID: "server-function-id" 
  },
  project: {
    pathRoot: () => process.cwd() 
  },
  out: () => path.join(process.cwd(), "dist")
};

const result = await (new WorkerRuntime()).build(null, buildInput)
console.log(result);
process.exit(0)
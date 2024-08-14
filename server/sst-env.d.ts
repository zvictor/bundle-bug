/* tslint:disable */
/* eslint-disable */
/// <reference path="../sst-env.d.ts" />
// cloudflare 
declare module "sst" {
  export interface Resource {
    "Trpc": import("@cloudflare/workers-types").Service
  }
}
export {}

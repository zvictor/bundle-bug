/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    "Client": {
      "type": "sst.cloudflare.Worker"
      "url": string
    }
    "Trpc": {
      "type": "sst.cloudflare.Worker"
      "url": string
    }
  }
}
export {}

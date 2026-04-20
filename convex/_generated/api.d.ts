/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as documentGeneration from "../documentGeneration.js";
import type * as documents from "../documents.js";
import type * as email from "../email.js";
import type * as gemini from "../gemini.js";
import type * as storage from "../storage.js";
import type * as submissions from "../submissions.js";
import type * as testDocGeneration from "../testDocGeneration.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  documentGeneration: typeof documentGeneration;
  documents: typeof documents;
  email: typeof email;
  gemini: typeof gemini;
  storage: typeof storage;
  submissions: typeof submissions;
  testDocGeneration: typeof testDocGeneration;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

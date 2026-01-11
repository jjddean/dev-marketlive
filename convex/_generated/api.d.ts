/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as bookings from "../bookings.js";
import type * as debug_email from "../debug_email.js";
import type * as documents from "../documents.js";
import type * as email from "../email.js";
import type * as geo from "../geo.js";
import type * as http from "../http.js";
import type * as paymentAttemptTypes from "../paymentAttemptTypes.js";
import type * as paymentAttempts from "../paymentAttempts.js";
import type * as pricing from "../pricing.js";
import type * as quotes from "../quotes.js";
import type * as reporting from "../reporting.js";
import type * as search from "../search.js";
import type * as seed from "../seed.js";
import type * as shipments from "../shipments.js";
import type * as simulation from "../simulation.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  bookings: typeof bookings;
  debug_email: typeof debug_email;
  documents: typeof documents;
  email: typeof email;
  geo: typeof geo;
  http: typeof http;
  paymentAttemptTypes: typeof paymentAttemptTypes;
  paymentAttempts: typeof paymentAttempts;
  pricing: typeof pricing;
  quotes: typeof quotes;
  reporting: typeof reporting;
  search: typeof search;
  seed: typeof seed;
  shipments: typeof shipments;
  simulation: typeof simulation;
  users: typeof users;
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

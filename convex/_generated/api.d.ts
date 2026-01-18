/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as ai from "../ai.js";
import type * as billing from "../billing.js";
import type * as bookings from "../bookings.js";
import type * as debug_email from "../debug_email.js";
import type * as documents from "../documents.js";
import type * as docusign from "../docusign.js";
import type * as email from "../email.js";
import type * as geo from "../geo.js";
import type * as http from "../http.js";
import type * as organizations from "../organizations.js";
import type * as paymentAttemptTypes from "../paymentAttemptTypes.js";
import type * as paymentAttempts from "../paymentAttempts.js";
import type * as payments from "../payments.js";
import type * as pricing from "../pricing.js";
import type * as quotes from "../quotes.js";
import type * as reporting from "../reporting.js";
import type * as search from "../search.js";
import type * as seed from "../seed.js";
import type * as shipments from "../shipments.js";
import type * as simulation from "../simulation.js";
import type * as stripe from "../stripe.js";
import type * as users from "../users.js";
import type * as workflows from "../workflows.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  ai: typeof ai;
  billing: typeof billing;
  bookings: typeof bookings;
  debug_email: typeof debug_email;
  documents: typeof documents;
  docusign: typeof docusign;
  email: typeof email;
  geo: typeof geo;
  http: typeof http;
  organizations: typeof organizations;
  paymentAttemptTypes: typeof paymentAttemptTypes;
  paymentAttempts: typeof paymentAttempts;
  payments: typeof payments;
  pricing: typeof pricing;
  quotes: typeof quotes;
  reporting: typeof reporting;
  search: typeof search;
  seed: typeof seed;
  shipments: typeof shipments;
  simulation: typeof simulation;
  stripe: typeof stripe;
  users: typeof users;
  workflows: typeof workflows;
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

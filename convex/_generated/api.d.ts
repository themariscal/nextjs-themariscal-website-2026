/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as academyCourses from "../academyCourses.js";
import type * as coursePurchases from "../coursePurchases.js";
import type * as http from "../http.js";
import type * as shortComments from "../shortComments.js";
import type * as subscriptionOfferings from "../subscriptionOfferings.js";
import type * as subscriptions from "../subscriptions.js";
import type * as users from "../users.js";
import type * as youtubeShorts from "../youtubeShorts.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  academyCourses: typeof academyCourses;
  coursePurchases: typeof coursePurchases;
  http: typeof http;
  shortComments: typeof shortComments;
  subscriptionOfferings: typeof subscriptionOfferings;
  subscriptions: typeof subscriptions;
  users: typeof users;
  youtubeShorts: typeof youtubeShorts;
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

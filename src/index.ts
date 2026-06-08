/**
 * Per-tenant admission limiter — public entry point.
 *
 * QA campaign F4 concurrency burst — RQ071085
 */

export { AdmissionLimiter } from './concurrency/AdmissionLimiter';
export type { AdmissionLimiterOptions, TenantStats } from './concurrency/AdmissionLimiter';

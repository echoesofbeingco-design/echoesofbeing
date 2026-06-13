/**
 * Feature flags.
 *
 * The community feature (peer-support feed + auth/login) is fully built and
 * lives in the repo, but is hidden from the public site for now. Flip this to
 * `true` to surface the navigation links, the homepage section, and the
 * login/profile UI again. The routes themselves (/community, /auth/*) remain
 * reachable by direct URL regardless of this flag.
 */
export const COMMUNITY_ENABLED = false;

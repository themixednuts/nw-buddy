export type EnvVars = typeof env
export const env = {
  /**
   * The build version string
   */
  version: 'v0',
  /**
   * Whether this is a New World PTR build
   */
  isPTR: false,
  /**
   * The path where models are located
   */
  cdnUrl: 'https://cdn.nw-buddy.de',
  /**
   * The deploy URL for assets and resources
   */
  deployUrl: '/',
}

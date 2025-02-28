declare module 'csso' {
  interface MinifyOptions {
    /** Structure optimizations */
    restructure?: boolean;
    /** Source map generation */
    sourceMap?: boolean;
    /** Debug mode */
    debug?: boolean;
    /** Usage data for advanced optimizations */
    usage?: object;
    /** List of commented keywords to keep */
    comments?: string | string[];
  }

  interface MinifyResult {
    /** The minified CSS code */
    css: string;
    /** The source map if requested */
    map?: object;
  }

  export function minify(css: string, options?: MinifyOptions): MinifyResult;
}

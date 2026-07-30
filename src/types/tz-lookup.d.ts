declare module 'tz-lookup' {
  /** Returns the IANA timezone id for a latitude/longitude (offline). */
  const tzlookup: (lat: number, lon: number) => string
  export default tzlookup
}

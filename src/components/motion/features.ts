import { domAnimation } from 'framer-motion'

// Default-exported from its own module so <LazyMotion features={() => import(...)}>
// can pull it as a SEPARATE async chunk. Importing `domAnimation` directly at a
// call site instead bundles the whole animation runtime into that chunk, which
// defeats the point of LazyMotion.
export default domAnimation

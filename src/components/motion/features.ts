import { domMax } from 'framer-motion'

// Default-exported from its own module so <LazyMotion features={() => import(...)}>
// can pull it as a SEPARATE async chunk. Importing the feature set directly at a
// call site instead bundles the whole animation runtime into that chunk, which
// defeats the point of LazyMotion.
//
// domMax (not domAnimation) because the tab strip uses a shared-layout indicator
// (layoutId) that springs between tabs — layout animations live in domMax's
// feature bundle. It is a few kB heavier than domAnimation, but it is still
// fetched as its own async chunk AFTER first paint, so it never blocks render.
export default domMax

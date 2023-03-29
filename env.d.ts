/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />
/// <reference types="cypress" />
/// <reference types="@histoire/plugin-vue/components" />

declare module 'postcss-focus-within/browser' {
  import focusWithinInit from 'postcss-focus-within/browser'
  export default focusWithinInit
}

declare module 'css-has-pseudo/browser' {
  import cssHasPseudo from 'css-has-pseudo/browser'
  export default cssHasPseudo
}

interface ImportMetaEnv {
  readonly VITE_IS_ONLINE: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
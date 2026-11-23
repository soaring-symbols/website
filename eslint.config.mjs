import withNuxt from '@nuxt/eslint-config'
import eslintPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default withNuxt(eslintPrettierRecommended, {
  languageOptions: {
    globals: {
      $fetch: false,
    },
  },
  rules: {
    // Prettier writes void elements as <img />; withNuxt's Vue rules come
    // after eslint-config-prettier and would turn this back on
    'vue/html-self-closing': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { ignoreRestSiblings: true },
    ],
  },
})

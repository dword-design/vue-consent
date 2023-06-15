import { isEqual } from 'lodash-es'
import { computed, reactive } from 'vue'

import services from './services/index.js'

export default {
  install: async (app, options) => {
    const $consent = reactive({
      isOpened: false,
      open: () => ($consent.isOpened = true),
      settings: computed({
        get: () =>
          typeof window === 'undefined'
            ? {}
            : JSON.parse(localStorage.getItem('consent') || '{}'),
        set: settings => {
          $consent.isOpened = false
          if (!isEqual(settings, $consent.settings)) {
            localStorage.setItem('consent', JSON.stringify(settings))
            window.location.reload()
          }
        },
      }),
      toggle: () => ($consent.isOpened = !$consent.isOpened),
    })
    app.config.globalProperties.$consent = $consent
    for (const name of Object.keys(services)) {
      await services[name]($consent.settings, options.services[name])
    }
  },
}

import { isEqual } from 'lodash-es'
import { computed, reactive } from 'vue'

import services from './services/index.js'

export default {
  install: async (app, options) => {
    const $consent = reactive({
      close: () => ($consent.isOpened = false),
      isOpened: false,
      open: () => ($consent.isOpened = true),
      settings: computed({
        get: () => JSON.parse(localStorage.getItem('consent') || '{}'),
        set: settings => {
          if (isEqual(settings, $consent.settings)) {
            return
          }
          localStorage.setItem('consent', JSON.stringify(settings))
          $consent.isOpened = false
          window.location.reload()
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

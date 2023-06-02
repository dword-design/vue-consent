import { isEqual } from 'lodash-es'
import { ref } from 'vue'

import services from './services/index.js'

export default {
  install: async (app, options) => {
    const isOpened = ref(false)
    app.config.globalProperties.$consent = {
      close: () => (isOpened.value = false),
      isOpened,
      open: () => (isOpened.value = true),
      toggle: () => (isOpened.value = !isOpened.value),
    }
    Object.defineProperty(app.config.globalProperties.$consent, 'settings', {
      get: () => JSON.parse(localStorage.getItem('consent') || '{}'),
      set: settings => {
        if (isEqual(settings, app.config.globalProperties.$consent.settings)) {
          return
        }
        localStorage.setItem('consent', JSON.stringify(settings))
        isOpened.value = false
        window.location.reload()
      },
    })
    for (const name of Object.keys(services)) {
      await services[name](
        app.config.globalProperties.$consent.settings,
        options.services[name],
      )
    }
  },
}

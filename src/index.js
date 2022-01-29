import services from './services'

export default {
  install: async (Vue, options) => {
    const state = Vue.observable({
      close: () => (state.isOpened = false),
      isOpened: false,
      open: () => (state.isOpened = true),
      toggle: () => (state.isOpened = !state.isOpened),
    })
    Object.defineProperty(state, 'settings', {
      get: () => JSON.parse(localStorage.getItem('consent') || '{}'),
      set: settings => {
        localStorage.setItem('consent', JSON.stringify(settings))
        state.isOpened = false
        window.location.reload()
      },
    })
    if (!Object.prototype.hasOwnProperty.call(Vue.prototype, '$consent')) {
      Object.defineProperty(Vue.prototype, '$consent', { get: () => state })
    }
    if (typeof window !== 'undefined') {
      for (const name of Object.keys(services)) {
        await services[name](state.settings, options.services[name])
      }
    }
  },
}

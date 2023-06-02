import { endent } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginPuppeteer from '@dword-design/tester-plugin-puppeteer'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { execaCommand } from 'execa'
import nuxtDevReady from 'nuxt-dev-ready'
import outputFiles from 'output-files'
import kill from 'tree-kill-promise'

export default tester(
  {
    async modal() {
      await outputFiles({
        'pages/index.vue': endent`
          <template>
            <button v-if="$consent.isOpened" class="foo" @click="$consent.isOpened = false" />
          </template>

          <script>
          export default {
            mounted() {
              this.$consent.isOpened = true
            }
          }
          </script>
        `,
        'plugins/plugin.js': endent`
          import { defineNuxtPlugin } from '#imports'

          import Self from '../../src/index.js'

          export default defineNuxtPlugin(({ vueApp }) => vueApp.use(Self, { services: { googleAnalytics: {} } }))
        `,
      })

      const nuxt = execaCommand('nuxt dev', { env: { NODE_ENV: '' } })
      try {
        await nuxtDevReady()
        await this.page.goto('http://localhost:3000')

        const modal = await this.page.waitForSelector('.foo')
        await modal.click()
        await this.page.waitForSelector('.foo', { hidden: true })
      } finally {
        await kill(nuxt.pid)
      }
    },
    async 'set settings'() {
      await outputFiles({
        'pages/index.vue': endent`
          <template>
            <div />
          </template>

          <script>
          export default {
            mounted() {
              this.$consent.settings = { statistics: true }
            }
          }
          </script>
        `,
        'plugins/plugin.js': endent`
          import { defineNuxtPlugin } from '#imports'

          import Self from '../../src/index.js'

          export default defineNuxtPlugin(({ vueApp }) => vueApp.use(Self, { services: { googleAnalytics: {} } }))
        `,
      })

      const nuxt = execaCommand('nuxt dev', { env: { NODE_ENV: '' } })
      try {
        await nuxtDevReady()
        await this.page.goto('http://localhost:3000')
        await this.page.waitForFunction(() => localStorage.getItem('consent'))

        const settings = await this.page.evaluate(() =>
          JSON.parse(localStorage.getItem('consent')),
        )
        expect(settings).toEqual({ statistics: true })
      } finally {
        await kill(nuxt.pid)
      }
    },
  },
  [testerPluginTmpDir(), testerPluginPuppeteer()],
)

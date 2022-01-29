import { join, replace } from '@dword-design/functions'
import Cookie from 'js-cookie'
import { parseDomain, ParseResultType } from 'parse-domain'

export default (settings, config) => {
  if (!settings.statistics) {
    window[`ga-disable-${config.id}`] = true

    const parsedDomain = parseDomain(document.domain)

    const domain =
      parsedDomain.type === ParseResultType.Listed
        ? [parsedDomain.domain, ...parsedDomain.topLevelDomains] |> join('.')
        : document.domain
    Cookie.remove('_ga', { domain, path: '/' })
    Cookie.remove(`_ga_gid_${config.id |> replace(/-/g, '_')}`, {
      domain,
      path: '/',
    })

    const ga4PropertiesMatch = config.id.match(/^G-(.*)$/)
    if (ga4PropertiesMatch) {
      Cookie.remove(`_ga_${ga4PropertiesMatch[1]}`, { domain, path: '/' })
    }
    Cookie.remove('_gid', { domain, path: '/' })
    Cookie.remove('_gat', { domain, path: '/' })
    Cookie.remove('ajs_anonymous_id', { domain, path: '/' })
  }
}

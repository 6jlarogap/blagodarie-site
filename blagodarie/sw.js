const staticCacheName = 'bd-app-v3'
const dynamicCacheName = 'bd-dynamic-v3'

const assetsUrls = [
    './index.html',
    /*'./code.js',
    './qrcode.min.js',
    './settings.js',*/
    './offline.html',
    './images/check.png',
    './images/credit-card.png',
    './images/delete.png',
    './images/email.png',
    './images/enter.png',
    './images/lofder-key.png',
    './images/ic_launcher.png',
    './images/link.png',
    './images/phone.png',
    './images/qr-code.png',
    './images/shareee.png',
    './images/sleep.png',
    './images/sms.png',
    './images/at.png',
    './images/trust_active.png',
    './images/mistrust_active.png',
    './images/trust_inactive.png',
    './images/mistrust_inactive.png',
    './images/abilities_root.png',
    './images/ability.png',
    './images/menu.png',
    './images/filter.png'
]

self.addEventListener('install', async event => {
    const cache = await caches.open(staticCacheName)
    await cache.addAll(assetsUrls)
})

self.addEventListener('activate', async event => {
    const cacheNames = await caches.keys()
    await Promise.all(
        cacheNames
            .filter(name => name !== staticCacheName && name !== dynamicCacheName)
            .map(name => caches.delete(name))
    )
    
})

self.addEventListener('fetch', event => {
    const { request } = event

    if (!request.url.includes(`api`) && !request.url.includes(`https://mc.yandex.ru`) && !request.url.includes(`https://xn--80aabjfzq0au.xn--p1ai/`))
    {
        event.respondWith(networkFirst(request))
    }
    
})

async function networkFirst(request) {
    const cache = await caches.open(dynamicCacheName)
    
    try {
        const response = await fetch(request)
        await cache.put(request, response.clone())
        return response
    } catch (error) {
        const cahced = await cache.match(request)
        return cahced ?? await caches.match('./offline.html')
    }

}
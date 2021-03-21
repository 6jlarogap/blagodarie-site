const staticCacheName = 'bd-app-v6'
const dynamicCacheName = 'bd-dynamic-v1'

const assetsUrls = [
    './index.html',
    './code.js',
    './qrcode.min.js',
    './settings.js',
    '/offline.html',
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
    './images/mistrust_inactive.png'
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
    const url = new URL(request.url)
    if (url.origin === location.origin) {
         event.respondWith(cacheFirst(request))
    } else {
        event.respondWith(networkFirst(request))
    }
})

async function cacheFirst(request) {
    const cached = await caches.match(request)
    return cached ?? await fetch(request)
}

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
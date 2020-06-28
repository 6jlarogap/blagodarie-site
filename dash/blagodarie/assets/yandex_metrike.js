function show_ya_metrika() {
    // Когда разрешать обращение к yandex metrika
    var result = false;
    var pathname = window.location.pathname;
    if ((!pathname || pathname == '/') && window.location.protocol != 'file:') {
        var location_host = window.location.host;
        var allowed_sites = [
            'blagodarie.org',
            'xn--80aabjfhut3aw.xn--p1ai',
            'www.blagodarie.org',
            'www.xn--80aabjfhut3aw.xn--p1ai'
        ];
        for (var i = 0; i < allowed_sites.length; i++) {
            if (allowed_sites[i] == location_host) {
                result = true;
                break;
            }
        }
    }
    return result;
}
(
    function(m,e,t,r,i,k,a){
        if (show_ya_metrika()) {
            m[i]=m[i]||function(){
                    (m[i].a=m[i].a||[]).push(arguments)
                };
            m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
        }
    }
)
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
ym(62165461, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        webvisor:true
});

function show_ya_metrika() {
    // Когда разрешать обращение к yandex metrika
    var result = false;
    if (window.location.protocol != 'file:') {
        var location_host = window.location.host;
        var allowed_sites = [
            'health.blagodarie.org',
            'health.xn--80aabjfzq0au.xn--p1ai'
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
        webvisor:false
});

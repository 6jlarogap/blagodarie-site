
// local_settings.example.js
// ----------------------------

// Пример для local_settings.js

// Что, возможно, надо изменить для другого 
// домена

// Это вряд ли надо изменять для другого домена.
//
API_URL = 'https://api.blagoroda.bsuir.by';

// Домен для куки.

// Вместо заранее определенного некорректно было бы ставить
// window.location.host:
// можем обращаться к page.org.com, а куку надо ставить
// на org.com

ROOT_DOMAIN = 'blagoroda.bsuir.by';

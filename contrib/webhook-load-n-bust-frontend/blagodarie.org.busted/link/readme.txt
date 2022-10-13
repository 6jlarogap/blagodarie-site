Здесь 2 soft links, с именами dev и prod.

Содержимое линков изменяестся процедурами webhook-scripts/blagodarie.org/master|dev-site/update.sh,
так чтобы линки указывали на .../busted/dev|prod/<время>/blagodarie

Здешние 2 soft links, с именами dev/blagodarie и prod/blagodarie прописаны в DocumentRoot
в апач- виртуальных хостах соответствующих версий проекта, см. ../../etc-apache2/sites-enabled

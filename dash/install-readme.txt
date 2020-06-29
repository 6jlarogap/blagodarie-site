install-readme.txt
------------------

Установка Dash проекта project на сервер Apache в Ubuntu Linux.

    * Полагаем:

        Пусть project - это:

            - имя проекта на github.com
                Полагаем, что проект там хранится. Возможен другой ресурс,
                например, bitbucket.org
            - имя каталога кода проекта
            - имя сайта: project.org
            - каталог, где сертификаты на сайт https://project.org,
                /home/www-data/ssl-certificates/sslforfree/project.org/
              получаемые от https://www.sslforfree.com/
        
        - ~/venv/project:        
                                        virtual environment проекта.
                                        Пусть будет в домашнем каталоге установщика.

        - /home/www-data/project:
                                        каталог проекта

        - /home/www-data/project/project:
                                        код проекта

        - USERNAME_GIT:                 имя пользователя на github.com:
                                        ресурсе, где хранится git копия проекта

        - USERNAME_LINUX                имя пользователя в ОС Linux

        - ubuntu:                       ubuntu server 18.04 или выше
 
    * Д.б. установлено на Linux:
        - средства разработки:
            * python3:
                  * sudo apt install python3-all-dev
                  * sudo apt install python3-virtualenv python3-pycurl virtualenv

         - web сервер apache2:
            sudo apt install apache2  apache2-utils

         -git
            sudo apt install git

    * mkdir -p ~/venv; cd ~/venv
    * virtualenv -p `which python3` project
    *   sudo mkdir -p /home/www-data
        cd /home/www-data
        sudo chown USERNAME_LINUX:USERNAME_LINUX .
    * git clone https://USERNAME@github.com/USERNAME_GIT/project.git
    * cd /home/www-data/project
    * source ~/venv/project/bin/activate
    * pip install -r pip.txt
    * deactivate
    * cd /home/www-data/project/project
    * cp local_settings.py.example local_settings.py
    * внести правки в local_settings.py, но если необходимо.
    * cd /home/www-data/project
      ln -s /home/LINUX-USER-NAME/venv/project ENV
            : virtual env, запускаемое из ./manage.py

    !!! Проверим работу сервера разработчика:
        cd /home/www-data/project/project
        python3 __init__.py
        http://site.name:8050 : что-то должно быть
        Ctrl-C
    
    * chown -R www-data:www-data ~/venv/project
      chown -R www-data:www-data /home/www-data/project

Настройка сервера Apache:

    * Должны быть установлены mod_wsgi и mod_xsendfile.
        sudo apt install libapache2-mod-wsgi-py3

    * sudo a2enmod ssl rewrite wsgi

    * пример настройки виртуального хоста Apache

    <VirtualHost *:80>
        ServerName project.org

        # Здесь, в папку /.well-known/acme-challenge/,
        # кладем контрольные файлы при формировании
        # сертификатов от https://www.sslforfree.com/.
        # При любом другом запросе, нежели
        # в /.well-known/acme-challenge/,
        # идем на htps://
        #
        DocumentRoot /home/www-data/ssl-for-free
        <Directory /home/www-data/ssl-for-free>
            Require all granted
        </Directory>

        RewriteEngine On
        RewriteCond %{REQUEST_URI} !^/\.well-known/acme-challenge/
        RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI}
    </VirtualHost>

    <VirtualHost *:443>

        ServerName project.org

        SSLEngine on
        SSLProtocol all -SSLv2
        SSLCipherSuite ALL:!ADH:!EXPORT:!SSLv2:RC4+RSA:+HIGH:+MEDIUM

        SSLCertificateFile /home/www-data/ssl-certificates/sslforfree/project.org/certificate.crt
        SSLCertificateKeyFile /home/www-data/ssl-certificates/sslforfree/project.org/private.key
        SSLCertificateChainFile /home/www-data/ssl-certificates/sslforfree/project.org/ca_bundle.crt

        Alias /.well-known   /home/www-data//home/www-data/project/project/static/.well-known/
        Alias /.well-known/  /home/www-data//home/www-data/project/project/static/.well-known/

        Alias /agreement   /home/www-data//home/www-data/project/project/static/agreement/
        Alias /agreement/  /home/www-data//home/www-data/project/project/static/agreement/

        Alias /соглашение /home/www-data//home/www-data/project/project/static/agreement/
        Alias /соглашение/ /home/www-data//home/www-data/project/project/static/agreement/

        Alias /static/          /home/www-data/project/project/static/
        <Directory /home/www-data/project/project/static/>
            Require all granted
        </Directory>

        # После maximum-request wsgi- application reloads, во избежание потребления
        # слишком много памяти. Reloads только когда wsgi- application не активно
        # и этого момента ждет graceful-timeout секунд. Если wsgi- application зависло
        # в течение deadlock-timeout, перезагружать его
        #
        WSGIDaemonProcess project.org display-name=%{GROUP} threads=16 maximum-requests=10000 graceful-timeout=7200 deadlock-timeout=60 home=/home/www-data/project/project

        WSGIProcessGroup  project.org
        WSGIScriptAlias / /home/www-data/project/project/wsgi.py

        # Во избежание ошибок: premature end of script headers wsgi.py
        #
        WSGIApplicationGroup %{GLOBAL}

        WSGIPassAuthorization On

        <FilesMatch "wsgi\.py$">
            Require all granted
        </FilesMatch>

    </VirtualHost>]

    * Добавить в конфигурацию (/etc/apache2/conf-enabled) .conf-файл, например,
      с именем reqtimeout.conf следующего содержания:

        # Minimize IOError request data read exeptions when posting data
        #
        # http://stackoverflow.com/questions/3823280/ioerror-request-data-read-error
        # http://httpd.apache.org/docs/2.2/mod/mod_reqtimeout.html
        #
        RequestReadTimeout header=90,MinRate=500 body=90,MinRate=500

        - выполнить sudo a2enmod reqtimeout

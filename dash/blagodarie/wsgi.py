#!/usr/bin/python3
import sys, os
import logging

activate_this = os.path.join(os.path.dirname(__file__), '..', 'ENV', 'bin', 'activate_this.py')
if os.path.exists(activate_this):
    with open(activate_this) as acivate_this_file:
        exec(compile(acivate_this_file.read(), activate_this, 'exec'), dict(__file__=activate_this))

logging.basicConfig(stream=sys.stderr)
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.dirname(__file__))

from blagodarie import server as application

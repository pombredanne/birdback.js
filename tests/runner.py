# -*- coding: utf-8 -*-
import time

from ghost import Ghost
from ghost.test import ServerThread

from server import app


MOCK_PORT = 5001


def check_state(title, state):
    assert state == 'passed'


def test_mocha():
    server_thread = ServerThread(app, MOCK_PORT)
    server_thread.daemon = True
    server_thread.start()
    while not hasattr(server_thread, 'http_server'):
        time.sleep(0.01)
    g = Ghost(wait_timeout=10)
    g.open('http://localhost:%s/static/index.html' % MOCK_PORT)
    g.wait_for(lambda: g.evaluate('isMochaRunning()')[0], 10)
    total = int(g.evaluate('__mocha_runner__.total')[0])
    n = 0
    while n < total:
        g.wait_for(lambda: g.evaluate('__mocha_tests__.length > %s' % n)[0],
            10)
        title = g.evaluate('__mocha_tests__[%s].title' % n)[0]
        state = g.evaluate('__mocha_tests__[%s].state' % n)[0]
        yield check_state, title, state
        n += 1
    server_thread.join()

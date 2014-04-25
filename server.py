#!/usr/bin/env python
import logging

from tornado.escape import json_decode, json_encode
from tornado.ioloop import IOLoop
from tornado import gen
from tornado.options import define, options, parse_command_line, parse_config_file
from tornado.web import Application, RequestHandler, authenticated
from tornado.httpclient import AsyncHTTPClient
import os.path

define('port', default=7777, help="port to listen on")

class GenAsyncHandler(RequestHandler):
    @gen.coroutine
    def get(self):
        http_client = AsyncHTTPClient()
        #response = yield http_client.fetch("https://www.themuse.com/api/v1/jobs?page=0&company=Artsicle&job_category=Engineering&job_level=Internship&job_location=New+York%2C+NY")
        
        #print(response.body)
        #jsonResponse = json_decode(response.body)
        #print(jsonResponse["results"])
        self.render("index.html")

class GenAsyncHandlerJson(RequestHandler):
    @gen.coroutine
    def get(self):
        http_client = AsyncHTTPClient()
        #name = self.get_argument('job_location', False)
        urlParams = self.request.uri[6:]
        print(urlParams)
        response = yield http_client.fetch("https://www.themuse.com/api/v1/jobs?" + urlParams)
        
        #print(response.body)
        jsonResponse = json_decode(response.body)
        #print(jsonResponse["results"])
        self.write(jsonResponse);




class MyApplication(Application):
    def __init__(self):
        handlers = [('/', GenAsyncHandler),
                    ('/json*', GenAsyncHandlerJson),
        ]

        settings = dict(
            cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            xsrf_cookies=True,
        )

        Application.__init__(self, handlers, **settings)


def main():
    app = MyApplication()
    app.listen(options.port)
    logging.info('Listening on http://localhost:%d' % options.port)
    IOLoop.instance().start()

if __name__ == '__main__':
    main()


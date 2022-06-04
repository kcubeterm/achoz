
from wsgiref.simple_server import make_server
from pyramid.config import Configurator
from pyramid.view import view_config
from pyramid.response import FileResponse
import os
import global_var


static_path = os.path.join(os.path.dirname(__file__),'static')


@view_config(route_name="home")
def home(request):
   return FileResponse(os.path.join(static_path,'html','index.html'))

@view_config(route_name='search')
def search(request):
    return FileResponse(os.path.join(static_path,'html','search.html'))

@view_config(route_name='api',renderer="json")
def search_api(request):
    print(request)
    query = request.params.get('q')
    page = int(request.params.get('page',1))
    offsetValue = 0
    limitValue = 10
    if page > 1:
        offsetValue = (page * limitValue) - limitValue
    

    options = {
        "offset": offsetValue,
        "limit": limitValue,
        "attributesToHighlight": ['content', 'name'],
        "attributesToRetrieve": ['id', 'title', 'abspath', 'mime'],
        "attributesToCrop": ['content'],
        "cropLength": 200
            }
    return global_var.meili_client.index(global_var.index_name).search(query,options)

@view_config(route_name='file_req')
def file_req(request):
    uid = request.params.get('uid')
    file_path = global_var.meili_client.get_document(uid).get('abspath')
    return FileResponse(file_path)

@view_config(route_name="health",renderer="json")
def health(request):
    return {"status":"available"}
def main():
    with Configurator() as config:
        config.add_route('home',"/")
        config.add_route('search',"/search")
        config.add_route('file_req',"file")
        config.add_route('api','/search-api')
        config.add_route('health','/health')
        config.add_static_view('static', static_path)
        config.scan()
        app = config.make_wsgi_app()
        try:
            server = make_server('localhost',global_var.web_port,app)
            server.serve_forever()
        
        except:
            global_var.logger.error(f'Web server could not started, mostprobably, any other service is running on port: {global_var.web_port}')
            pass

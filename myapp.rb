require 'sinatra'
require 'haml'
require 'httparty'
require 'json'
require './helpers.rb'

class MyApp < Sinatra::Base
    get '/' do
        haml :index, :format => :html5
    end

    get '/placester.json' do
        content_type :json
        Placester.new.getall()
    end

    get '/placesterbox.json' do
        content_type :json
        Placester.new.getbox(38.40817031622094, -77.4261927246094, 39.14527183695017, -76.1188196777344)
    end

    post '/placesterbox.json' do
        content_type :json
        @minlat = params[:minlat]
        @minlong = params[:minlong]
        @maxlat = params[:maxlat]
        @maxlong = params[:maxlong]
        #thisbounds = JSON.parse(request.body.read)
        Placester.new.getbox(@minlat,@minlong, @maxlat, @maxlong)
    end
end

MyApp.run!

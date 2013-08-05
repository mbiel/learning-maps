require 'httparty'

PLACESTER_API_KEY = ENV['PLACESTER_API_KEY']

class Placester
    include HTTParty

    def initialize
        self.class.base_uri 'http://api.placester.com'
    end

    def getall
        #return self.class.base_uri+"#{PLACESTER_API_KEY}"
        response = self.class.get('/api/v2.1/listings.json', :query => {:api_key => "#{PLACESTER_API_KEY}"})
        topost = []
        response["listings"].each do |item|
            id = item["id"]
            latitude = item["location"]["coords"][0]
            longitude = item["location"]["coords"][1]
            topost << {:id => id, :latitude => latitude, :longitude => longitude}
        end
        return topost.to_json
    end

    def getbox(min_lat, min_long, max_lat, max_long, page)
        queryoffset = page == 0 ? "" : "#{page*50}"
        querystring = "box[min_latitude]=#{min_lat}&box[max_latitude]=#{max_lat}&box[min_longitude]=#{min_long}&box[max_longitude]=#{max_long}"+queryoffset
        response = self.class.get("http://api.placester.com/api/v2.1/listings.json?api_key=#{PLACESTER_API_KEY}&#{querystring}")
        totallistings = response["total"]
        offset = response["offset"]
        topost = []
        topost << {:total => totallistings, :offset => offset}
        places = []
        response["listings"].each do |item|
            id = item["id"]
            desc = item["cur_data"]["desc"]
            url = item["cur_data"]["url"]
            latitude = item["location"]["coords"][0]
            longitude = item["location"]["coords"][1]
            places << {:id => id, :latitude => latitude, :longitude => longitude, :description => desc, :url => url}
        end

        #add_each_listing(response, topost)
        #until offset+50 >= totallistings
            #offset += 50
            #querystring = "box[min_latitude]=#{min_lat}&box[max_latitude]=#{max_lat}&box[min_longitude]=#{min_long}&box[max_longitude]=#{max_long}&offset=#{offset}"
            #response = self.class.get("http://api.placester.com/api/v2.1/listings.json?api_key=#{PLACESTER_API_KEY}&#{querystring}")
            #add_each_listing(response, topost)
        #end
        topost << places
        return topost.to_json
    end

    def add_each_listing(response, topost)
            end
end

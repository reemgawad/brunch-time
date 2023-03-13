require 'json'
require 'open-uri'

class RestaurantsController < ApplicationController
  skip_before_action :authenticate_user!, only: %i[index show]
  before_action :set_restaurant, only: %i[show toggle_favorite]

  def index
    fetch_restaurants
    # Filter:
    # 1- No search values present
    # 2- Location value
    @restaurants = Restaurant.all.order(wait_time: :asc)
    @restaurants = @restaurants.where("address ILIKE ?", "%#{params[:location]}%") unless params[:location].blank?
    # @restaurants = @restaurants.where("wait_time <= ?", params[:wait_time]) unless params[:wait_time].blank?

    display_markers(@restaurants)
    response_formats
  end

  def show
    @visit = Visit.new
    @visits = @restaurant.visits.where.not(arrived: false).order(date: :desc)
  end

  def toggle_favorite
    current_user.favorited?(@restaurant) ? current_user.unfavorite(@restaurant) : current_user.favorite(@restaurant)
  end

  def my_favorites
    @favorites = current_user.all_favorited
  end

  private

  def set_restaurant
    @restaurant = Restaurant.find(params[:id])
  end

  def fetch_restaurants
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=brunch_restaurants%20in%20Montreal,opennow&key=#{ENV['PLACES_API_KEY']}"
    url_serialized = URI.parse(url).read
    @results = JSON.parse(url_serialized)["results"]
    @results.each do |object|
      fetch_single_restaurant(object["place_id"])
    end
  end

  def fetch_single_restaurant(place_id)
    url = "https://maps.googleapis.com/maps/api/place/details/json?place_id=#{place_id}&fields=name,rating,formatted_phone_number,formatted_address,geometry,current_opening_hours,price_level,photos&key=#{ENV['PLACES_API_KEY']}"
    url_serialized = URI.parse(url).read
    result = JSON.parse(url_serialized)["result"]

    # Check if address already exists in DB
    # Create a new Restaurant object using data received
    create_restaurant(result) unless Restaurant.find_by(address: result["formatted_address"])
  end

  def fetch_restaurant_photo(resto, photo_ref)
    url = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=#{photo_ref}&key=#{ENV['PLACES_API_KEY']}"
    file = URI.parse(url).open
    resto.photo.attach(io: file, filename: "#{resto.name}.png", content_type: "image/png")
    resto.save!
  end

  def create_restaurant(result)
    resto = Restaurant.create!(
      name: result["name"],
      address: result["formatted_address"],
      price_range: result["price_level"],
      opening_hours: result["current_opening_hours"]["weekday_text"].join("\n"),
      phone_number: result["formatted_phone_number"],
      latitude: result["geometry"]["location"]["lat"],
      longitude: result["geometry"]["location"]["lng"]
    )
    fetch_restaurant_photo(resto, result["photos"].first["photo_reference"]) unless result["photos"].nil?
  end

  # Map marker helper
  def display_markers(restaurants)
    @markers = restaurants.geocoded.map do |restaurant|
      {
        lat: restaurant.latitude,
        lng: restaurant.longitude,
        info_window: render_to_string(partial: "info_window.html", locals: { restaurant: restaurant }),
        image_url: helpers.asset_url("beer.png")
      }
    end
  end

  def response_formats
    respond_to do |format|
      format.html
      format.json do
        render json: {
          restaurants: render_to_string('restaurants/_list.html', layout: false, locals: { restaurants: @restaurants }),
          markers: @markers.to_json
        }
      end
    end
  end
end

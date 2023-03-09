require 'json'
require 'open-uri'

class RestaurantsController < ApplicationController
  skip_before_action :authenticate_user!, only: %i[index show]
  before_action :set_restaurant, only: %i[show toggle_favorite]

  def index
    # Filter:
    # 1- No search values present
    # 2- Only location value
    # 3- Only wait-time value
    # 4- Both location and wait-time
    @restaurants = Restaurant.all.order(wait_time: :asc)
    @restaurants = @restaurants.where("address ILIKE ?", "%#{params[:location]}%") unless params[:location].blank?
    @restaurants = @restaurants.where("wait_time <= ?", params[:wait_time]) unless params[:wait_time].blank?

    @markers = @restaurants.geocoded.map do |restaurant|
      {
        lat: restaurant.latitude,
        lng: restaurant.longitude,
        info_window: render_to_string(partial: "info_window.html", locals: { restaurant: restaurant }),
        image_url: helpers.asset_url("beer.png")
      }
    end

    # implementing ajax in search
    respond_to do |format|
      format.html
      format.json do
        render json: {
          restaurants: render_to_string('restaurants/_list.html', layout: false, locals: { restaurants: @restaurants }),
          markers: @markers.to_json
        }
      end
    end
    fetch_restaurants
    raise
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
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants%20in%20Montreal&key=#{ENV['PLACES_API_KEY']}"
    url_serialized = URI.open(url).read
    @data = JSON.parse(url_serialized)["results"].first
  end
end

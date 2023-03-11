require "application_system_test_case"

class RestaurantsTest < ApplicationSystemTestCase
  setup do
    @restaurant = Restaurant.first
    @restaurants = Restaurant.all
  end

  test "Showing 1 restaurant" do
    visit restaurants_path
    click_link @restaurant.name

    assert_selector "h1", text: @restaurant.name
  end

  test "Showing all restaurants" do
    visit restaurants_path
    @restaurants.each do |restaurant|
      assert_selector "h3", text: restaurant.name
      assert_selector "img"
    end
  end
end

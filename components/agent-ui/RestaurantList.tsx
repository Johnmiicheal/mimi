"use client";

import { MapPin, Star, CurrencyDollar, Clock, ForkKnife } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  rating: number;
  reviews: number;
  priceLevel: 1 | 2 | 3 | 4; // $ to $$$$
  location: {
    name: string;
    distance?: string; // "0.5 km from hotel"
  };
  hours?: string;
  dietaryOptions?: string[]; // ["vegetarian", "vegan", "gluten-free"]
  specialties?: string[];
  image?: string;
  bookingUrl?: string;
}

interface RestaurantListProps {
  restaurants: Restaurant[];
  dietaryFilters?: string[];
  onRestaurantClick?: (restaurant: Restaurant) => void;
}

const priceSymbols = {
  1: "$",
  2: "$$",
  3: "$$$",
  4: "$$$$"
};

const dietaryEmojis: Record<string, string> = {
  vegetarian: "🥬",
  vegan: "🌱",
  "gluten-free": "🌾",
  halal: "🕌",
  kosher: "✡️",
};

export function RestaurantList({
  restaurants,
  dietaryFilters = [],
  onRestaurantClick
}: RestaurantListProps) {
  const filteredRestaurants = dietaryFilters.length > 0
    ? restaurants.filter(r =>
        dietaryFilters.some(filter =>
          r.dietaryOptions?.includes(filter)
        )
      )
    : restaurants;

  return (
    <div className="space-y-4">
      {/* Filter indicator */}
      {dietaryFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
            Filtered by:
          </span>
          {dietaryFilters.map(filter => (
            <span
              key={filter}
              className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-800 text-xs font-medium text-blue-700 dark:text-blue-200"
            >
              {dietaryEmojis[filter]} {filter}
            </span>
          ))}
        </div>
      )}

      {/* Restaurant cards */}
      {filteredRestaurants.map((restaurant, index) => (
        <motion.div
          key={restaurant.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <motion.button
            onClick={() => onRestaurantClick?.(restaurant)}
            className={cn(
              "w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700",
              "hover:border-blue-300 dark:hover:border-blue-600",
              "hover:shadow-lg transition-all duration-200",
              "overflow-hidden text-left"
            )}
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex gap-4 p-5">
              {/* Image or icon */}
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
                {restaurant.image ? (
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <ForkKnife weight="duotone" className="w-10 h-10 text-white" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {restaurant.cuisine}
                      </span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                        {priceSymbols[restaurant.priceLevel]}
                      </span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <Star weight="fill" className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {restaurant.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({restaurant.reviews})
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {restaurant.description}
                </p>

                {/* Specialties */}
                {restaurant.specialties && restaurant.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {restaurant.specialties.slice(0, 3).map((specialty, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}

                {/* Dietary options */}
                {restaurant.dietaryOptions && restaurant.dietaryOptions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {restaurant.dietaryOptions.map((option, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-xs font-medium text-green-700 dark:text-green-300 flex items-center gap-1"
                      >
                        <span>{dietaryEmojis[option]}</span>
                        <span>{option}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer info */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                  {/* Location */}
                  <div className="flex items-center gap-1">
                    <MapPin weight="fill" className="w-3 h-3" />
                    <span>{restaurant.location.name}</span>
                    {restaurant.location.distance && (
                      <span className="text-blue-600 dark:text-blue-400">
                        ({restaurant.location.distance})
                      </span>
                    )}
                  </div>

                  {/* Hours */}
                  {restaurant.hours && (
                    <div className="flex items-center gap-1">
                      <Clock weight="bold" className="w-3 h-3" />
                      <span>{restaurant.hours}</span>
                    </div>
                  )}
                </div>

                {/* Booking button */}
                {restaurant.bookingUrl && (
                  <div className="mt-3">
                    <div className="inline-flex px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                      Reserve Table →
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.button>
        </motion.div>
      ))}

      {filteredRestaurants.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <ForkKnife className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No restaurants found</p>
          <p className="text-sm">Try adjusting your dietary filters</p>
        </div>
      )}
    </div>
  );
}

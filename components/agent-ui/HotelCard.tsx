"use client";

import { MapPin, Star, WifiHigh, Coffee, Barbell, Bed, CheckCircle } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Hotel {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  price: number; // per night
  totalPrice?: number; // for entire stay
  location: {
    name: string;
    lat: number;
    lng: number;
    distanceToCenter?: string; // "0.5 km to city center"
  };
  amenities: string[];
  photos?: string[];
  description?: string;
  cancellation?: string; // "Free cancellation until 24h before"
  score?: number; // internal ranking score
}

interface HotelCardListProps {
  hotels: Hotel[];
  nights: number;
  onHotelClick?: (hotel: Hotel) => void;
  bestValueId?: string; // ID of best value hotel
}

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <WifiHigh weight="fill" className="w-4 h-4" />,
  breakfast: <Coffee weight="fill" className="w-4 h-4" />,
  gym: <Barbell weight="fill" className="w-4 h-4" />,
  pool: <span className="text-sm">🏊</span>,
  parking: <span className="text-sm">🅿️</span>,
  spa: <span className="text-sm">💆</span>,
  restaurant: <span className="text-sm">🍽️</span>,
};

export function HotelCardList({
  hotels,
  nights,
  onHotelClick,
  bestValueId
}: HotelCardListProps) {
  return (
    <div className="space-y-4">
      {hotels.map((hotel, index) => {
        const isBestValue = hotel.id === bestValueId;
        const totalPrice = hotel.totalPrice || hotel.price * nights;

        return (
          <motion.div
            key={hotel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Best value badge */}
            {isBestValue && (
              <motion.div
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: -12 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                className="absolute -top-3 -right-3 z-10"
              >
                <div className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold shadow-lg flex items-center gap-1">
                  <CheckCircle weight="fill" className="w-4 h-4" />
                  Best Location
                </div>
              </motion.div>
            )}

            <motion.button
              onClick={() => onHotelClick?.(hotel)}
              className={cn(
                "w-full bg-white dark:bg-gray-800 rounded-2xl border",
                "hover:shadow-lg transition-all duration-200",
                "overflow-hidden text-left",
                isBestValue
                  ? "border-green-300 dark:border-green-600"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
              )}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex gap-4 p-5">
                {/* Image */}
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
                  {hotel.photos && hotel.photos[0] ? (
                    <img
                      src={hotel.photos[0]}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Bed weight="duotone" className="w-16 h-16 text-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                        {hotel.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {/* Rating */}
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                          <Star weight="fill" className="w-4 h-4 text-yellow-500" />
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">
                            {hotel.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({hotel.reviews})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${hotel.price}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        per night
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        ${totalPrice.toLocaleString()} total
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {hotel.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {hotel.description}
                    </p>
                  )}

                  {/* Location */}
                  <div className="flex items-start gap-2 mb-3">
                    <MapPin weight="fill" className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="text-gray-700 dark:text-gray-300">
                        {hotel.location.name}
                      </div>
                      {hotel.location.distanceToCenter && (
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                          {hotel.location.distanceToCenter}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {hotel.amenities.slice(0, 6).map((amenity, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300"
                      >
                        {amenityIcons[amenity.toLowerCase()]}
                        <span className="capitalize">{amenity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Cancellation policy */}
                  {hotel.cancellation && (
                    <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle weight="fill" className="w-3 h-3" />
                      <span>{hotel.cancellation}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          </motion.div>
        );
      })}
    </div>
  );
}

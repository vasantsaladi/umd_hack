"use client";

import { cn } from "@/lib/utils";
import { format, isWithinInterval } from "date-fns";
import { useEffect, useState } from "react";

interface WeatherAtLocation {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
  };
  hourly_units: {
    time: string;
    temperature_2m: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
  daily_units: {
    time: string;
    sunrise: string;
    sunset: string;
  };
  daily: {
    time: string[];
    sunrise: string[];
    sunset: string[];
  };
}

// Function to generate sample weather data with current dates
const generateSampleWeatherData = () => {
  const today = new Date();
  const formatDate = (date: Date, includeTime: boolean = false) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    if (!includeTime) {
      return `${year}-${month}-${day}`;
    }

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Generate hourly times for 5 days
  const hourlyTimes = [];
  for (let day = 0; day < 5; day++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + day);

    for (let hour = 0; hour < 24; hour++) {
      const hourDate = new Date(currentDate);
      hourDate.setHours(hour, 0, 0, 0);
      hourlyTimes.push(formatDate(hourDate, true));
    }
  }

  // Generate daily dates for 5 days
  const dailyDates = [];
  const sunriseTimes = [];
  const sunsetTimes = [];

  for (let day = 0; day < 5; day++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + day);
    dailyDates.push(formatDate(currentDate));

    // Sunrise time (around 7:15 AM with slight daily variation)
    const sunriseDate = new Date(currentDate);
    sunriseDate.setHours(7, 15 + day, 0, 0);
    sunriseTimes.push(formatDate(sunriseDate, true));

    // Sunset time (around 7:00 PM with slight daily decrease)
    const sunsetDate = new Date(currentDate);
    sunsetDate.setHours(19, 0 - day * 2, 0, 0);
    sunsetTimes.push(formatDate(sunsetDate, true));
  }

  return {
    latitude: 37.763283,
    longitude: -122.41286,
    generationtime_ms: 0.027894973754882812,
    utc_offset_seconds: 0,
    timezone: "GMT",
    timezone_abbreviation: "GMT",
    elevation: 18,
    current_units: {
      time: "iso8601",
      interval: "seconds",
      temperature_2m: "°C",
    },
    current: {
      time: formatDate(today, true),
      interval: 900,
      temperature_2m: 29.3,
    },
    hourly_units: { time: "iso8601", temperature_2m: "°C" },
    hourly: {
      time: hourlyTimes,
      temperature_2m: [
        36.6, 32.8, 29.5, 28.6, 29.2, 28.2, 27.5, 26.6, 26.5, 26, 25, 23.5,
        23.9, 24.2, 22.9, 21, 24, 28.1, 31.4, 33.9, 32.1, 28.9, 26.9, 25.2, 23,
        21.1, 19.6, 18.6, 17.7, 16.8, 16.2, 15.5, 14.9, 14.4, 14.2, 13.7, 13.3,
        12.9, 12.5, 13.5, 15.8, 17.7, 19.6, 21, 21.9, 22.3, 22, 20.7, 18.9,
        17.9, 17.3, 17, 16.7, 16.2, 15.6, 15.2, 15, 15, 15.1, 14.8, 14.8, 14.9,
        14.7, 14.8, 15.3, 16.2, 17.9, 19.6, 20.5, 21.6, 21, 20.7, 19.3, 18.7,
        18.4, 17.9, 17.3, 17, 17, 16.8, 16.4, 16.2, 16, 15.8, 15.7, 15.4, 15.4,
        16.1, 16.7, 17, 18.6, 19, 19.5, 19.4, 18.5, 17.9, 17.5, 16.7, 16.3,
        16.1,
        // Repeating some values to ensure we have enough data
        19.6, 18.6, 17.7, 16.8, 16.2, 15.5, 14.9, 14.4, 14.2, 13.7, 13.3, 12.9,
        12.5, 13.5, 15.8, 17.7, 19.6, 21, 21.9, 22.3, 22, 20.7, 18.9, 17.9,
      ],
    },
    daily_units: {
      time: "iso8601",
      sunrise: "iso8601",
      sunset: "iso8601",
    },
    daily: {
      time: dailyDates,
      sunrise: sunriseTimes,
      sunset: sunsetTimes,
    },
  };
};

// Generate sample data with current dates
const SAMPLE = generateSampleWeatherData();

function n(num: number): number {
  return Math.ceil(num);
}

export function Weather({
  weatherAtLocation = SAMPLE,
}: {
  weatherAtLocation?: WeatherAtLocation;
}) {
  const currentHigh = Math.max(
    ...weatherAtLocation.hourly.temperature_2m.slice(0, 24)
  );
  const currentLow = Math.min(
    ...weatherAtLocation.hourly.temperature_2m.slice(0, 24)
  );

  const isDay = isWithinInterval(new Date(weatherAtLocation.current.time), {
    start: new Date(weatherAtLocation.daily.sunrise[0]),
    end: new Date(weatherAtLocation.daily.sunset[0]),
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const hoursToShow = isMobile ? 5 : 6;

  // Find the index of the current time or the next closest time
  const currentTimeIndex = weatherAtLocation.hourly.time.findIndex(
    (time) => new Date(time) >= new Date(weatherAtLocation.current.time)
  );

  // Slice the arrays to get the desired number of items
  const displayTimes = weatherAtLocation.hourly.time.slice(
    currentTimeIndex,
    currentTimeIndex + hoursToShow
  );
  const displayTemperatures = weatherAtLocation.hourly.temperature_2m.slice(
    currentTimeIndex,
    currentTimeIndex + hoursToShow
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl p-4 skeleton-bg max-w-[500px]",
        {
          "bg-blue-400": isDay,
        },
        {
          "bg-indigo-900": !isDay,
        }
      )}
    >
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-2 items-center">
          <div
            className={cn(
              "size-10 rounded-full skeleton-div",
              {
                "bg-yellow-300": isDay,
              },
              {
                "bg-indigo-100": !isDay,
              }
            )}
          />
          <div className="text-4xl font-medium text-blue-50">
            {n(weatherAtLocation.current.temperature_2m)}
            {weatherAtLocation.current_units.temperature_2m}
          </div>
        </div>

        <div className="text-blue-50">{`H:${n(currentHigh)}° L:${n(
          currentLow
        )}°`}</div>
      </div>

      <div className="flex flex-row justify-between">
        {displayTimes.map((time, index) => (
          <div key={time} className="flex flex-col items-center gap-1">
            <div className="text-blue-100 text-xs">
              {format(new Date(time), "ha")}
            </div>
            <div
              className={cn(
                "size-6 rounded-full skeleton-div",
                {
                  "bg-yellow-300": isDay,
                },
                {
                  "bg-indigo-200": !isDay,
                }
              )}
            />
            <div className="text-blue-50 text-sm">
              {n(displayTemperatures[index])}
              {weatherAtLocation.hourly_units.temperature_2m}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

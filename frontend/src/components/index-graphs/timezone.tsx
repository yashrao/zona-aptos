import React, { useState, useEffect, useRef } from 'react';

interface TimezoneProps {
  initialCity?: string;
}

interface TimezoneOption {
  offset: number;
  label: string;
  city: string;
}

const timezoneOptions: TimezoneOption[] = [
  { offset: -11, label: "American Samoa, International Date Line West, Midway Island", city: "Midway Island" },
  { offset: -10, label: "Hawaii", city: "Hawaii" },
  { offset: -9, label: "Alaska", city: "Alaska" },
  { offset: -8, label: "Pacific Time (US & Canada)", city: "Los Angeles" },
  { offset: -8, label: "Tijuana", city: "Tijuana" },
  { offset: -7, label: "Arizona", city: "Phoenix" },
  { offset: -7, label: "Chihuahua", city: "Chihuahua" },
  { offset: -7, label: "Mazatlan", city: "Mazatlan" },
  { offset: -7, label: "Mountain Time (US & Canada)", city: "Denver" },
  { offset: -6, label: "Central America", city: "Managua" },
  { offset: -6, label: "Central Time (US & Canada)", city: "Chicago" },
  { offset: -6, label: "Guadalajara", city: "Guadalajara" },
  { offset: -6, label: "Mexico City", city: "Mexico City" },
  { offset: -6, label: "Monterrey", city: "Monterrey" },
  { offset: -6, label: "Saskatchewan", city: "Regina" },
  { offset: -5, label: "Bogota", city: "Bogota" },
  { offset: -5, label: "Eastern Time (US & Canada)", city: "New York" },
  { offset: -5, label: "Indiana (East)", city: "Indianapolis" },
  { offset: -5, label: "Lima", city: "Lima" },
  { offset: -5, label: "Quito", city: "Quito" },
  { offset: -4.5, label: "Caracas", city: "Caracas" },
  { offset: -4, label: "Atlantic Time (Canada)", city: "Halifax" },
  { offset: -4, label: "Georgetown", city: "Georgetown" },
  { offset: -4, label: "La Paz", city: "La Paz" },
  { offset: -4, label: "Santiago", city: "Santiago" },
  { offset: -3.5, label: "Newfoundland", city: "St. John's" },
  { offset: -3, label: "Brasilia", city: "Brasilia" },
  { offset: -3, label: "Buenos Aires", city: "Buenos Aires" },
  { offset: -3, label: "Greenland", city: "Nuuk" },
  { offset: -2, label: "Mid-Atlantic", city: "Mid-Atlantic" },
  { offset: -1, label: "Azores", city: "Ponta Delgada" },
  { offset: -1, label: "Cape Verde Is.", city: "Praia" },
  { offset: 0, label: "Casablanca", city: "Casablanca" },
  { offset: 0, label: "Dublin", city: "Dublin" },
  { offset: 0, label: "Edinburgh", city: "Edinburgh" },
  { offset: 0, label: "Lisbon", city: "Lisbon" },
  { offset: 0, label: "London", city: "London" },
  { offset: 0, label: "Monrovia", city: "Monrovia" },
  { offset: 0, label: "UTC", city: "UTC" },
  { offset: 1, label: "Amsterdam", city: "Amsterdam" },
  { offset: 1, label: "Berlin", city: "Berlin" },
  { offset: 1, label: "Bern", city: "Bern" },
  { offset: 1, label: "Rome", city: "Rome" },
  { offset: 1, label: "Stockholm", city: "Stockholm" },
  { offset: 1, label: "Vienna", city: "Vienna" },
  { offset: 1, label: "Belgrade", city: "Belgrade" },
  { offset: 1, label: "Bratislava", city: "Bratislava" },
  { offset: 1, label: "Budapest", city: "Budapest" },
  { offset: 1, label: "Ljubljana", city: "Ljubljana" },
  { offset: 1, label: "Prague", city: "Prague" },
  { offset: 1, label: "Brussels", city: "Brussels" },
  { offset: 1, label: "Copenhagen", city: "Copenhagen" },
  { offset: 1, label: "Madrid", city: "Madrid" },
  { offset: 1, label: "Paris", city: "Paris" },
  { offset: 1, label: "Sarajevo", city: "Sarajevo" },
  { offset: 1, label: "Skopje", city: "Skopje" },
  { offset: 1, label: "Warsaw", city: "Warsaw" },
  { offset: 1, label: "Zagreb", city: "Zagreb" },
  { offset: 1, label: "West Central Africa", city: "Lagos" },
  { offset: 2, label: "Athens", city: "Athens" },
  { offset: 2, label: "Bucharest", city: "Bucharest" },
  { offset: 2, label: "Istanbul", city: "Istanbul" },
  { offset: 2, label: "Cairo", city: "Cairo" },
  { offset: 2, label: "Harare", city: "Harare" },
  { offset: 2, label: "Helsinki", city: "Helsinki" },
  { offset: 2, label: "Jerusalem", city: "Jerusalem" },
  { offset: 2, label: "Kyiv", city: "Kyiv" },
  { offset: 2, label: "Pretoria", city: "Pretoria" },
  { offset: 2, label: "Riga", city: "Riga" },
  { offset: 2, label: "Sofia", city: "Sofia" },
  { offset: 2, label: "Tallinn", city: "Tallinn" },
  { offset: 2, label: "Vilnius", city: "Vilnius" },
  { offset: 3, label: "Baghdad", city: "Baghdad" },
  { offset: 3, label: "Kuwait", city: "Kuwait City" },
  { offset: 3, label: "Minsk", city: "Minsk" },
  { offset: 3, label: "Moscow", city: "Moscow" },
  { offset: 3, label: "Nairobi", city: "Nairobi" },
  { offset: 3, label: "Riyadh", city: "Riyadh" },
  { offset: 3, label: "St. Petersburg", city: "St. Petersburg" },
  { offset: 3, label: "Volgograd", city: "Volgograd" },
  { offset: 3.5, label: "Tehran", city: "Tehran" },
  { offset: 4, label: "Abu Dhabi", city: "Abu Dhabi" },
  { offset: 4, label: "Baku", city: "Baku" },
  { offset: 4, label: "Muscat", city: "Muscat" },
  { offset: 4, label: "Tbilisi", city: "Tbilisi" },
  { offset: 4, label: "Yerevan", city: "Yerevan" },
  { offset: 4.5, label: "Kabul", city: "Kabul" },
  { offset: 5, label: "Ekaterinburg", city: "Ekaterinburg" },
  { offset: 5, label: "Islamabad", city: "Islamabad" },
  { offset: 5, label: "Karachi", city: "Karachi" },
  { offset: 5, label: "Tashkent", city: "Tashkent" },
  { offset: 5.5, label: "Chennai", city: "Chennai" },
  { offset: 5.5, label: "Kolkata", city: "Kolkata" },
  { offset: 5.5, label: "Mumbai", city: "Mumbai" },
  { offset: 5.5, label: "New Delhi", city: "New Delhi" },
  { offset: 5.5, label: "Sri Jayawardenepura", city: "Sri Jayawardenepura" },
  { offset: 5.75, label: "Kathmandu", city: "Kathmandu" },
  { offset: 6, label: "Almaty", city: "Almaty" },
  { offset: 6, label: "Astana", city: "Astana" },
  { offset: 6, label: "Dhaka", city: "Dhaka" },
  { offset: 6, label: "Novosibirsk", city: "Novosibirsk" },
  { offset: 6, label: "Urumqi", city: "Urumqi" },
  { offset: 6.5, label: "Rangoon", city: "Rangoon" },
  { offset: 7, label: "Bangkok", city: "Bangkok" },
  { offset: 7, label: "Hanoi", city: "Hanoi" },
  { offset: 7, label: "Jakarta", city: "Jakarta" },
  { offset: 7, label: "Krasnoyarsk", city: "Krasnoyarsk" },
  { offset: 8, label: "Beijing", city: "Beijing" },
  { offset: 8, label: "Chongqing", city: "Chongqing" },
  { offset: 8, label: "Hong Kong", city: "Hong Kong" },
  { offset: 8, label: "Irkutsk", city: "Irkutsk" },
  { offset: 8, label: "Kuala Lumpur", city: "Kuala Lumpur" },
  { offset: 8, label: "Perth", city: "Perth" },
  { offset: 8, label: "Singapore", city: "Singapore" },
  { offset: 8, label: "Taipei", city: "Taipei" },
  { offset: 8, label: "Ulaanbaatar", city: "Ulaanbaatar" },
  { offset: 9, label: "Osaka", city: "Osaka" },
  { offset: 9, label: "Sapporo", city: "Sapporo" },
  { offset: 9, label: "Seoul", city: "Seoul" },
  { offset: 9, label: "Tokyo", city: "Tokyo" },
  { offset: 9, label: "Yakutsk", city: "Yakutsk" },
  { offset: 9.5, label: "Adelaide", city: "Adelaide" },
  { offset: 9.5, label: "Darwin", city: "Darwin" },
  { offset: 10, label: "Brisbane", city: "Brisbane" },
  { offset: 10, label: "Canberra", city: "Canberra" },
  { offset: 10, label: "Guam", city: "Guam" },
  { offset: 10, label: "Hobart", city: "Hobart" },
  { offset: 10, label: "Magadan", city: "Magadan" },
  { offset: 10, label: "Melbourne", city: "Melbourne" },
  { offset: 10, label: "Port Moresby", city: "Port Moresby" },
  { offset: 10, label: "Solomon Is.", city: "Honiara" },
  { offset: 10, label: "Sydney", city: "Sydney" },
  { offset: 10, label: "Vladivostok", city: "Vladivostok" },
  { offset: 11, label: "New Caledonia", city: "Noumea" },
  { offset: 12, label: "Auckland", city: "Auckland" },
  { offset: 12, label: "Fiji", city: "Suva" },
  { offset: 12, label: "Kamchatka", city: "Petropavlovsk-Kamchatsky" },
  { offset: 12, label: "Marshall Is.", city: "Majuro" },
  { offset: 12, label: "Wellington", city: "Wellington" },
  { offset: 12, label: "Nuku'alofa", city: "Nuku'alofa" },
  { offset: 12, label: "Samoa", city: "Apia" },
  { offset: 13, label: "Tokelau Is.", city: "Fakaofo" },
];



const Timezone: React.FC<TimezoneProps> = ({ initialCity = "Beijing" }) => {
    const [selectedCity, setSelectedCity] = useState(initialCity);
    const [currentTime, setCurrentTime] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
  
  
    useEffect(() => {
      const updateTime = () => {
        const now = new Date();
        const selectedOption = timezoneOptions.find(option => option.city === selectedCity);
        if (selectedOption) {
          const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
          const selectedTime = new Date(utcTime + (3600000 * selectedOption.offset));
          setCurrentTime(selectedTime.toLocaleTimeString());
        }
      };
  
      updateTime();
      const timer = setInterval(updateTime, 1000);
  
      return () => clearInterval(timer);
    }, [selectedCity]);
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsDropdownOpen(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
  

    const selectedOption = timezoneOptions.find(option => option.city === selectedCity);

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="text-white text-sm hover:bg-[#2C2C2E] px-2 py-1 rounded"
        >
          Current time: {currentTime} {selectedOption ? `(UTC${selectedOption.offset >= 0 ? '+' : ''}${selectedOption.offset})` : ''}
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 bottom-full mb-1 bg-[#2C2C2E] rounded shadow-lg z-10 max-h-[400px] overflow-y-auto custom-scrollbar">
            {timezoneOptions.map((option) => (
              <button
                key={option.city}
                onClick={() => {
                  setSelectedCity(option.city);
                  setIsDropdownOpen(false);
                }}
                className="block w-full text-left text-white text-sm px-4 py-2 hover:bg-[#3A3A3C]"
              >
                (UTC{option.offset >= 0 ? '+' : ''}{option.offset}) {option.city}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  export default Timezone;
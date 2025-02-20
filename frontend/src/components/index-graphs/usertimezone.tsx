export async function getUserTimezone(): Promise<string> {
    return new Promise((resolve, reject) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const response = await fetch(
                `https://api.timezonedb.com/v2.1/get-time-zone?key=YOUR_TIMEZONEDB_API_KEY&format=json&by=position&lat=${position.coords.latitude}&lng=${position.coords.longitude}`
              );
              const data = await response.json();
              resolve(data.zoneName);
            } catch (error) {
              console.error('Error fetching timezone:', error);
              resolve('Asia/Shanghai'); // Default to Beijing if there's an error
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
            resolve('Asia/Shanghai'); // Default to Beijing if geolocation is denied
          }
        );
      } else {
        resolve('Asia/Shanghai'); // Default to Beijing if geolocation is not supported
      }
    });
  }
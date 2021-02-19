export interface MessageProperties {
  location: string;
  current: {
    description: string;
    icon: string;
    temp: number;
    feltTemp: number;
    windSpeed: number;
  };
  daily: {
    date: number;
    description: string;
    icon: string;
    minTemp: number;
    maxTemp: number;
    morningTemp: number;
    dayTemp: number;
    eveningTemp: number;
    nightTemp: number;
  }[];
}

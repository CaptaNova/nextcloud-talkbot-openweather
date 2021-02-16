export interface MessageProperties {
  location: string;
  daily?: {
    date: number;
    description: string;
    icon: string;
    minTemp: number;
    maxTemp: number;
  }[];
}

export type NetworkService = {
  id: string;
  name: string;
  hardwarePort: string;
  device: string;
  status: NetworkServiceStatus;
  favorite: boolean;
  order: number;
};

export type NetworkServiceStatus = "connected" | "connecting" | "disconnecting" | "disconnected" | "invalid";

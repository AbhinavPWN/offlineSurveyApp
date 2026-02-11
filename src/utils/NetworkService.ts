import NetInfo from "@react-native-community/netinfo";

export interface NetworkService {
  isOnline(): Promise<boolean>;
}

export class NetworkServiceImpl implements NetworkService {
  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();

    return Boolean(state.isConnected && state.isInternetReachable !== false);
  }
}

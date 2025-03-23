// Define the structure of network config entries
export interface NetworkConfig {
    MyOFT: string;
    name: string;
    symbol: string;
    LZEndpoint: string;
    owner: string;
    endpointId: string;
    [key: string]: string;
}

// Define the type for the entire config
export type Config = {
    [chainId: string]: NetworkConfig;
};

// Structure for remote network data
export interface PeerSetting {
    oftAddress: string;
    endpointId: string;
}

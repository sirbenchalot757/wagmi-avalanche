import * as React from 'react';
import { providers } from 'ethers';
import { WagmiClient, ClientConfig as WagmiClientConfig } from '@wagmi/core';
import { QueryClient } from 'react-query';
import { Persister } from 'react-query/persistQueryClient';
export declare type DecoratedWagmiClient<TProvider extends providers.BaseProvider = providers.BaseProvider, TWebSocketProvider extends providers.BaseProvider = providers.WebSocketProvider> = WagmiClient<TProvider, TWebSocketProvider> & {
    queryClient: QueryClient;
};
export declare const Context: React.Context<DecoratedWagmiClient<providers.BaseProvider, providers.WebSocketProvider> | undefined>;
export declare type ClientConfig<TProvider extends providers.BaseProvider = providers.BaseProvider, TWebSocketProvider extends providers.BaseProvider = providers.WebSocketProvider> = WagmiClientConfig<TProvider, TWebSocketProvider> & {
    queryClient?: QueryClient;
    persister?: Persister;
};
export declare function createClient<TProvider extends providers.BaseProvider, TWebSocketProvider extends providers.BaseProvider>({ queryClient, persister, ...config }?: ClientConfig<TProvider, TWebSocketProvider>): WagmiClient<TProvider, TWebSocketProvider> & {
    queryClient: QueryClient;
};
export declare type ProviderProps<TProvider extends providers.BaseProvider = providers.BaseProvider, TWebSocketProvider extends providers.BaseProvider = providers.WebSocketProvider> = {
    /** React-decorated WagmiClient instance */
    client?: DecoratedWagmiClient<TProvider, TWebSocketProvider>;
};
export declare function Provider<TProvider extends providers.BaseProvider, TWebSocketProvider extends providers.BaseProvider>({ children, client, }: React.PropsWithChildren<ProviderProps<TProvider, TWebSocketProvider>>): JSX.Element;
export declare function useClient<TProvider extends providers.BaseProvider, TWebSocketProvider extends providers.BaseProvider = providers.WebSocketProvider>(): DecoratedWagmiClient<TProvider, TWebSocketProvider>;

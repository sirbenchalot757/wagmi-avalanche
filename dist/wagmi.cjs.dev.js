'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var core = require('@wagmi/core');
var reactQuery = require('react-query');
var persistQueryClient = require('react-query/persistQueryClient');
var createWebStoragePersister = require('react-query/createWebStoragePersister');
var ethers = require('ethers/lib/ethers');
var index_js = require('use-sync-external-store/shim/index.js');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespace(React);

const findAndReplace = (cacheRef, _ref) => {
  let {
    find,
    replace
  } = _ref;

  if (cacheRef && find(cacheRef)) {
    return replace(cacheRef);
  }

  if (typeof cacheRef !== 'object') {
    return cacheRef;
  }

  if (Array.isArray(cacheRef)) {
    return cacheRef.map(item => findAndReplace(item, {
      find,
      replace
    }));
  }

  if (cacheRef instanceof Object) {
    return Object.entries(cacheRef).reduce((curr, _ref2) => {
      let [key, value] = _ref2;
      return { ...curr,
        [key]: findAndReplace(value, {
          find,
          replace
        })
      };
    }, {});
  }

  return cacheRef;
};

function deserialize(cachedString) {
  const cache = JSON.parse(cachedString);
  const deserializedCacheWithBigNumbers = findAndReplace(cache, {
    find: data => data.type === 'BigNumber',
    replace: data => ethers.BigNumber.from(data.hex)
  });
  return deserializedCacheWithBigNumbers;
}

/**
 * @function getReferenceKey
 *
 * @description
 * get the reference key for the circular value
 *
 * @param keys the keys to build the reference key from
 * @param cutoff the maximum number of keys to include
 * @returns the reference key
 */
function getReferenceKey(keys, cutoff) {
  return keys.slice(0, cutoff).join('.') || '.';
}
/**
 * @function getCutoff
 *
 * @description
 * faster `Array.prototype.indexOf` implementation build for slicing / splicing
 *
 * @param array the array to match the value in
 * @param value the value to match
 * @returns the matching index, or -1
 */


function getCutoff(array, value) {
  const {
    length
  } = array;

  for (let index = 0; index < length; ++index) {
    if (array[index] === value) {
      return index + 1;
    }
  }

  return 0;
}

/**
 * @function createReplacer
 *
 * @description
 * create a replacer method that handles circular values
 *
 * @param [replacer] a custom replacer to use for non-circular values
 * @param [circularReplacer] a custom replacer to use for circular methods
 * @returns the value to stringify
 */
function createReplacer(replacer, circularReplacer) {
  const hasReplacer = typeof replacer === 'function';
  const hasCircularReplacer = typeof circularReplacer === 'function';
  const cache = [];
  const keys = [];
  return function replace(key, value) {
    if (typeof value === 'object') {
      if (cache.length) {
        const thisCutoff = getCutoff(cache, this);

        if (thisCutoff === 0) {
          cache[cache.length] = this;
        } else {
          cache.splice(thisCutoff);
          keys.splice(thisCutoff);
        }

        keys[keys.length] = key;
        const valueCutoff = getCutoff(cache, value);

        if (valueCutoff !== 0) {
          return hasCircularReplacer ? circularReplacer.call(this, key, value, getReferenceKey(keys, valueCutoff)) : "[ref=".concat(getReferenceKey(keys, valueCutoff), "]");
        }
      } else {
        cache[0] = value;
        keys[0] = key;
      }
    }

    return hasReplacer ? replacer.call(this, key, value) : value;
  };
}
/**
 * @function stringify
 *
 * @description
 * strinigifer that handles circular values
 * Forked from https://github.com/planttheidea/fast-stringify
 *
 * @param value to stringify
 * @param [replacer] a custom replacer function for handling standard values
 * @param [indent] the number of spaces to indent the output by
 * @param [circularReplacer] a custom replacer function for handling circular values
 * @returns the stringified output
 */


function serialize(value, replacer, indent, circularReplacer) {
  return JSON.stringify(value, createReplacer(replacer, circularReplacer), indent !== null && indent !== void 0 ? indent : undefined);
}

const Context = /*#__PURE__*/React__namespace.createContext(undefined);
function createClient() {
  let {
    queryClient = new reactQuery.QueryClient({
      defaultOptions: {
        queries: {
          cacheTime: 1000 * 60 * 60 * 24,
          // 24 hours
          networkMode: 'offlineFirst',
          refetchOnWindowFocus: false,
          retry: 0
        },
        mutations: {
          networkMode: 'offlineFirst'
        }
      }
    }),
    persister = typeof window !== 'undefined' ? createWebStoragePersister.createWebStoragePersister({
      key: 'wagmi.cache',
      storage: window.localStorage,
      serialize,
      deserialize
    }) : undefined,
    ...config
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const client = core.createClient(config);
  if (persister) persistQueryClient.persistQueryClient({
    queryClient,
    persister,
    dehydrateOptions: {
      shouldDehydrateQuery: query => query.cacheTime !== 0
    }
  });
  return Object.assign(client, {
    queryClient
  });
}
function Provider(_ref) {
  let {
    children,
    client = createClient()
  } = _ref;
  // Attempt to connect on mount
  React__namespace.useEffect(() => {

    (async () => {
      if (!client.config.autoConnect) return;
      await client.autoConnect();
    })(); // eslint-disable-next-line react-hooks/exhaustive-deps

  }, []);
  return /*#__PURE__*/React__namespace.createElement(Context.Provider, {
    value: client
  }, /*#__PURE__*/React__namespace.createElement(reactQuery.QueryClientProvider, {
    client: client.queryClient
  }, children));
}
function useClient() {
  const client = React__namespace.useContext(Context);
  if (!client) throw Error('Must be used within WagmiProvider');
  return client;
}

function useProvider() {
  let {
    chainId
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const forceUpdate = useForceUpdate();
  const client = useClient();
  const provider = React__namespace.useRef(core.getProvider({
    chainId
  }));
  React__namespace.useEffect(() => {
    const unwatch = core.watchProvider({
      chainId
    }, provider_ => {
      provider.current = provider_;
      forceUpdate();
    });
    return unwatch;
  }, [chainId, client, forceUpdate]);
  return provider.current;
}

function useWebSocketProvider() {
  let {
    chainId
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const forceUpdate = useForceUpdate();
  const client = useClient();
  const webSocketProvider = React__namespace.useRef(core.getWebSocketProvider({
    chainId
  }));
  React__namespace.useEffect(() => {
    const unwatch = core.watchWebSocketProvider({
      chainId
    }, webSocketProvider_ => {
      webSocketProvider.current = webSocketProvider_;
      forceUpdate();
    });
    return unwatch;
  }, [chainId, client, forceUpdate]);
  return webSocketProvider.current;
}

function useChainId() {
  let {
    chainId
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const provider = useProvider({
    chainId
  });
  return provider.network.chainId;
}

function useForceUpdate() {
  const [, forceUpdate] = React__namespace.useReducer(x => x + 1, 0);
  return forceUpdate;
}

function useQuery(queryKey, queryFn, options_) {
  const options = {
    queryKey,
    queryFn,
    ...options_
  };
  const queryClient = reactQuery.useQueryClient({
    context: options.context
  });
  const isRestoring = reactQuery.useIsRestoring();
  const errorResetBoundary = reactQuery.useQueryErrorResetBoundary();
  const defaultedOptions = queryClient.defaultQueryOptions(options); // Make sure results are optimistically set in fetching state before subscribing or updating options

  defaultedOptions._optimisticResults = isRestoring ? 'isRestoring' : 'optimistic'; // Include callbacks in batch renders

  if (defaultedOptions.onError) {
    defaultedOptions.onError = reactQuery.notifyManager.batchCalls(defaultedOptions.onError);
  }

  if (defaultedOptions.onSuccess) {
    defaultedOptions.onSuccess = reactQuery.notifyManager.batchCalls(defaultedOptions.onSuccess);
  }

  if (defaultedOptions.onSettled) {
    defaultedOptions.onSettled = reactQuery.notifyManager.batchCalls(defaultedOptions.onSettled);
  }

  if (defaultedOptions.suspense) {
    // Always set stale time when using suspense to prevent
    // fetching again when directly mounting after suspending
    if (typeof defaultedOptions.staleTime !== 'number') {
      defaultedOptions.staleTime = 1000;
    }
  }

  if (defaultedOptions.suspense || defaultedOptions.useErrorBoundary) {
    // Prevent retrying failed query if the error boundary has not been reset yet
    if (!errorResetBoundary.isReset()) {
      defaultedOptions.retryOnMount = false;
    }
  }

  const [observer] = React__namespace.useState(() => new reactQuery.QueryObserver(queryClient, defaultedOptions));
  const {
    data,
    dataUpdatedAt,
    error,
    errorUpdatedAt,
    failureCount,
    fetchStatus,
    isError,
    isFetched,
    isFetchedAfterMount,
    isFetching,
    isLoading,
    isLoadingError,
    isPaused,
    isPlaceholderData,
    isPreviousData,
    isRefetchError,
    isRefetching,
    isStale,
    isSuccess,
    refetch,
    remove,
    status: status_
  } = observer.getOptimisticResult(defaultedOptions);
  index_js.useSyncExternalStore(React__namespace.useCallback(onStoreChange => isRestoring ? () => undefined : observer.subscribe(reactQuery.notifyManager.batchCalls(onStoreChange)), [observer, isRestoring]), () => observer.getCurrentResult(), () => observer.getCurrentResult());
  React__namespace.useEffect(() => {
    errorResetBoundary.clearReset();
  }, [errorResetBoundary]);
  React__namespace.useEffect(() => {
    // Do not notify on updates because of changes in the options because
    // these changes should already be reflected in the optimistic result.
    observer.setOptions(defaultedOptions, {
      listeners: false
    });
  }, [defaultedOptions, observer]); // Handle suspense

  if (defaultedOptions.suspense && isLoading && isFetching && !isRestoring) {
    throw observer.fetchOptimistic(defaultedOptions).then(_ref => {
      var _defaultedOptions$onS, _defaultedOptions$onS2;

      let {
        data
      } = _ref;
      (_defaultedOptions$onS = defaultedOptions.onSuccess) === null || _defaultedOptions$onS === void 0 ? void 0 : _defaultedOptions$onS.call(defaultedOptions, data);
      (_defaultedOptions$onS2 = defaultedOptions.onSettled) === null || _defaultedOptions$onS2 === void 0 ? void 0 : _defaultedOptions$onS2.call(defaultedOptions, data, null);
    }).catch(error => {
      var _defaultedOptions$onE, _defaultedOptions$onS3;

      errorResetBoundary.clearReset();
      (_defaultedOptions$onE = defaultedOptions.onError) === null || _defaultedOptions$onE === void 0 ? void 0 : _defaultedOptions$onE.call(defaultedOptions, error);
      (_defaultedOptions$onS3 = defaultedOptions.onSettled) === null || _defaultedOptions$onS3 === void 0 ? void 0 : _defaultedOptions$onS3.call(defaultedOptions, undefined, error);
    });
  } // Handle error boundary


  if (isError && !errorResetBoundary.isReset() && !isFetching && shouldThrowError(defaultedOptions.useErrorBoundary, [error, observer.getCurrentQuery()])) {
    throw error;
  }

  const status = status_ === 'loading' && fetchStatus === 'idle' ? 'idle' : status_;
  const isIdle = status === 'idle';
  const isLoading_ = status === 'loading' && fetchStatus === 'fetching';
  const result = {
    data,
    error,
    fetchStatus,
    isError,
    isFetched,
    isFetching,
    isIdle,
    isLoading: isLoading_,
    isRefetching,
    isSuccess,
    refetch,
    status,
    internal: {
      dataUpdatedAt,
      errorUpdatedAt,
      failureCount,
      isFetchedAfterMount,
      isLoadingError,
      isPaused,
      isPlaceholderData,
      isPreviousData,
      isRefetchError,
      isStale,
      remove
    }
  }; // Handle result property usage tracking

  return !defaultedOptions.notifyOnChangeProps ? trackResult(result, observer) : result;
}

function trackResult(result, observer) {
  const trackedResult = {};
  Object.keys(result).forEach(key => {
    Object.defineProperty(trackedResult, key, {
      configurable: false,
      enumerable: true,
      get: () => {
        // @ts-expect-error ??? aware we are mutating private `trackedProps` property.
        observer.trackedProps.add(key);
        return result[key];
      }
    });
  });
  return trackedResult;
}

function shouldThrowError(_useErrorBoundary, params) {
  // Allow useErrorBoundary function to override throwing behavior on a per-error basis
  if (typeof _useErrorBoundary === 'function') {
    return _useErrorBoundary(...params);
  }

  return !!_useErrorBoundary;
}

const queryKey$b = () => [{
  entity: 'account'
}];

const queryFn$b = () => {
  const result = core.getAccount();
  if (result.address) return result;
  return null;
};

function useAccount() {
  let {
    suspense,
    onError,
    onSettled,
    onSuccess
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const queryClient = reactQuery.useQueryClient();
  const accountQuery = useQuery(queryKey$b(), queryFn$b, {
    staleTime: 0,
    suspense,
    onError,
    onSettled,
    onSuccess
  });
  React__namespace.useEffect(() => {
    const unwatch = core.watchAccount(data => {
      queryClient.setQueryData(queryKey$b(), data !== null && data !== void 0 && data.address ? data : null);
    });
    return unwatch;
  }, [queryClient]);
  return accountQuery;
}

const queryKey$a = _ref => {
  let {
    chainId
  } = _ref;
  return [{
    entity: 'blockNumber',
    chainId
  }];
};

const queryFn$a = _ref2 => {
  let {
    queryKey: [{
      chainId
    }]
  } = _ref2;
  return core.fetchBlockNumber({
    chainId
  });
};

function useBlockNumber() {
  let {
    cacheTime = 0,
    chainId: chainId_,
    enabled = true,
    staleTime,
    suspense,
    watch = false,
    onError,
    onSettled,
    onSuccess
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const chainId = useChainId({
    chainId: chainId_
  });
  const provider = useProvider();
  const webSocketProvider = useWebSocketProvider();
  const queryClient = reactQuery.useQueryClient();
  React__namespace.useEffect(() => {
    if (!watch) return;

    const listener = blockNumber => {
      // Just to be safe in case the provider implementation
      // calls the event callback after .off() has been called
      queryClient.setQueryData(queryKey$a({
        chainId
      }), blockNumber);
    };

    const provider_ = webSocketProvider !== null && webSocketProvider !== void 0 ? webSocketProvider : provider;
    provider_.on('block', listener);
    return () => {
      provider_.off('block', listener);
    };
  }, [chainId, provider, queryClient, watch, webSocketProvider]);
  return useQuery(queryKey$a({
    chainId
  }), queryFn$a, {
    cacheTime,
    enabled,
    staleTime,
    suspense,
    onError,
    onSettled,
    onSuccess
  });
}

const queryKey$9 = _ref => {
  let {
    chainId,
    formatUnits
  } = _ref;
  return [{
    entity: 'feeData',
    chainId,
    formatUnits
  }];
};

const queryFn$9 = _ref2 => {
  let {
    queryKey: [{
      chainId,
      formatUnits
    }]
  } = _ref2;
  return core.fetchFeeData({
    chainId,
    formatUnits
  });
};

function useFeeData() {
  let {
    cacheTime,
    chainId: chainId_,
    enabled = true,
    formatUnits = 'wei',
    staleTime,
    suspense,
    watch,
    onError,
    onSettled,
    onSuccess
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const chainId = useChainId({
    chainId: chainId_
  });
  const feeDataQuery = useQuery(queryKey$9({
    chainId,
    formatUnits
  }), queryFn$9, {
    cacheTime,
    enabled,
    staleTime,
    suspense,
    onError,
    onSettled,
    onSuccess
  });
  const {
    data: blockNumber
  } = useBlockNumber({
    watch
  });
  React__namespace.useEffect(() => {
    if (!enabled) return;
    if (!watch) return;
    if (!blockNumber) return;
    feeDataQuery.refetch(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);
  return feeDataQuery;
}

const queryKey$8 = _ref => {
  let {
    addressOrName,
    chainId,
    formatUnits,
    token
  } = _ref;
  return [{
    entity: 'balance',
    addressOrName,
    chainId,
    formatUnits,
    token
  }];
};

const queryFn$8 = _ref2 => {
  let {
    queryKey: [{
      addressOrName,
      chainId,
      formatUnits,
      token
    }]
  } = _ref2;
  if (!addressOrName) throw new Error('address is required');
  return core.fetchBalance({
    addressOrName,
    chainId,
    formatUnits,
    token
  });
};

function useBalance() {
  let {
    addressOrName,
    cacheTime,
    chainId: chainId_,
    enabled = true,
    formatUnits = 'ether',
    staleTime,
    suspense,
    token,
    watch,
    onError,
    onSettled,
    onSuccess
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const chainId = useChainId({
    chainId: chainId_
  });
  const balanceQuery = useQuery(queryKey$8({
    addressOrName,
    chainId,
    formatUnits,
    token
  }), queryFn$8, {
    cacheTime,
    enabled: Boolean(enabled && addressOrName),
    staleTime,
    suspense,
    onError,
    onSettled,
    onSuccess
  });
  const {
    data: blockNumber
  } = useBlockNumber({
    watch
  });
  React__namespace.useEffect(() => {
    if (!enabled) return;
    if (!watch) return;
    if (!blockNumber) return;
    if (!addressOrName) return;
    balanceQuery.refetch(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);
  return balanceQuery;
}

const mutationKey$6 = args => [{
  entity: 'connect',
  ...args
}];

const mutationFn$5 = args => {
  const {
    connector
  } = args;
  if (!connector) throw new Error('connector is required');
  return core.connect({
    connector
  });
};

function useConnect() {
  let {
    connector,
    onBeforeConnect,
    onConnect,
    onError,
    onSettled
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const forceUpdate = useForceUpdate();
  const client = useClient();
  const {
    data,
    error,
    mutate,
    mutateAsync,
    reset,
    status,
    variables
  } = reactQuery.useMutation(mutationKey$6({
    connector
  }), mutationFn$5, {
    onError,
    onMutate: onBeforeConnect,
    onSettled,
    onSuccess: onConnect
  });
  React__namespace.useEffect(() => {
    // Trigger update when connector or status change
    const unsubscribe = client.subscribe(state => ({
      connector: state.connector,
      connectors: state.connectors,
      status: state.status
    }), forceUpdate, {
      equalityFn: (selected, previous) => selected.connector === previous.connector && selected.connectors === previous.connectors && selected.status === previous.status
    });
    return unsubscribe;
  }, [client, forceUpdate]);
  const connect = React__namespace.useCallback(connector_ => mutate({
    connector: connector_ !== null && connector_ !== void 0 ? connector_ : connector
  }), [connector, mutate]);
  const connectAsync = React__namespace.useCallback(connector_ => mutateAsync({
    connector: connector_ !== null && connector_ !== void 0 ? connector_ : connector
  }), [connector, mutateAsync]);
  let status_;
  if (client.status === 'reconnecting') status_ = 'reconnecting';else if (status === 'loading' || client.status === 'connecting') status_ = 'connecting';else if (client.connector) status_ = 'connected';else if (!client.connector || status === 'success') status_ = 'disconnected';else status_ = status;
  return {
    activeConnector: client.connector,
    connect,
    connectAsync,
    connectors: client.connectors,
    data,
    error,
    isConnected: status_ === 'connected',
    isConnecting: status_ === 'connecting',
    isDisconnected: status_ === 'disconnected',
    isError: status === 'error',
    isIdle: status_ === 'idle',
    isReconnecting: status_ === 'reconnecting',
    pendingConnector: variables === null || variables === void 0 ? void 0 : variables.connector,
    reset,
    status: status_
  };
}

const mutationKey$5 = [{
  entity: 'disconnect'
}];

const mutationFn$4 = () => core.disconnect();

function useDisconnect() {
  let {
    onError,
    onMutate,
    onSettled,
    onSuccess
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const queryClient = reactQuery.useQueryClient();
  const {
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    mutate: disconnect,
    mutateAsync: disconnectAsync,
    reset,
    status
  } = reactQuery.useMutation(mutationKey$5, mutationFn$4, { ...(onError ? {
      onError(error, _variables, context) {
        onError(error, context);
      }

    } : {}),
    onMutate,
    ...(onSettled ? {
      onSettled(_data, error, _variables, context) {
        onSettled(error, context);
      }

    } : {}),

    onSuccess(_data, _variables, context) {
      // Clear account cache
      queryClient.removeQueries(queryKey$b()); // Pass on arguments

      onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(context);
    }

  });
  return {
    disconnect,
    disconnectAsync,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    reset,
    status
  };
}

const mutationKey$4 = args => [{
  entity: 'switchNetwork',
  ...args
}];

const mutationFn$3 = args => {
  const {
    chainId
  } = args;
  if (!chainId) throw new Error('chainId is required');
  return core.switchNetwork({
    chainId
  });
};

function useNetwork() {
  var _network$current$chai;

  let {
    chainId,
    onError,
    onMutate,
    onSettled,
    onSuccess
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const forceUpdate = useForceUpdate();
  const network = React__namespace.useRef(core.getNetwork());
  const client = useClient();
  const queryClient = reactQuery.useQueryClient();
  const connector = client.connector;
  const {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    mutate,
    mutateAsync,
    reset,
    status,
    variables
  } = reactQuery.useMutation(mutationKey$4({
    chainId
  }), mutationFn$3, {
    onError,
    onMutate,
    onSettled,
    onSuccess
  });
  React__namespace.useEffect(() => {
    const unwatch = core.watchNetwork(data => {
      network.current = data;
      forceUpdate();
    });
    return unwatch;
  }, [forceUpdate, queryClient]);
  const switchNetwork_ = React__namespace.useCallback(chainId_ => mutate({
    chainId: chainId_ !== null && chainId_ !== void 0 ? chainId_ : chainId
  }), [chainId, mutate]);
  const switchNetworkAsync_ = React__namespace.useCallback(chainId_ => mutateAsync({
    chainId: chainId_ !== null && chainId_ !== void 0 ? chainId_ : chainId
  }), [chainId, mutateAsync]);
  return {
    activeChain: network.current.chain,
    chains: (_network$current$chai = network.current.chains) !== null && _network$current$chai !== void 0 ? _network$current$chai : [],
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    pendingChainId: variables === null || variables === void 0 ? void 0 : variables.chainId,
    reset,
    status,
    switchNetwork: connector !== null && connector !== void 0 && connector.switchChain ? switchNetwork_ : undefined,
    switchNetworkAsync: connector !== null && connector !== void 0 && connector.switchChain ? switchNetworkAsync_ : undefined,
    variables
  };
}

const queryKey$7 = () => [{
  entity: 'signer'
}];

const queryFn$7 = () => core.fetchSigner();

function useSigner() {
  let {
    suspense,
    onError,
    onSettled,
    onSuccess
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const signerQuery = useQuery(queryKey$7(), queryFn$7, {
    cacheTime: 0,
    staleTime: 0,
    suspense,
    onError,
    onSettled,
    onSuccess
  });
  const queryClient = reactQuery.useQueryClient();
  React__namespace.useEffect(() => {
    const unwatch = core.watchSigner(signer => queryClient.setQueryData(queryKey$7(), signer));
    return unwatch;
  }, [queryClient]);
  return signerQuery;
}

const mutationKey$3 = args => [{
  entity: 'signMessage',
  ...args
}];

const mutationFn$2 = args => {
  const {
    message
  } = args;
  if (!message) throw new Error('message is required');
  return core.signMessage({
    message
  });
};

function useSignMessage() {
  let {
    message,
    onError,
    onMutate,
    onSettled,
    onSuccess
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    mutate,
    mutateAsync,
    reset,
    status,
    variables
  } = reactQuery.useMutation(mutationKey$3({
    message
  }), mutationFn$2, {
    onError,
    onMutate,
    onSettled,
    onSuccess
  });
  const signMessage = React__namespace.useCallback(args => mutate(args || {
    message
  }), [message, mutate]);
  const signMessageAsync = React__namespace.useCallback(args => mutateAsync(args || {
    message
  }), [message, mutateAsync]);
  return {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    reset,
    signMessage,
    signMessageAsync,
    status,
    variables
  };
}

const mutationKey$2 = args => [{
  entity: 'signTypedData',
  ...args
}];

const mutationFn$1 = args => {
  const {
    domain,
    types,
    value
  } = args;
  if (!domain || !types || !value) throw new Error('domain, types, and value are all required');
  return core.signTypedData({
    domain,
    types,
    value
  });
};

function useSignTypedData() {
  let {
    domain,
    types,
    value,
    onError,
    onMutate,
    onSettled,
    onSuccess
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    mutate,
    mutateAsync,
    reset,
    status,
    variables
  } = reactQuery.useMutation(mutationKey$2({
    domain,
    types,
    value
  }), mutationFn$1, {
    onError,
    onMutate,
    onSettled,
    onSuccess
  });
  const signTypedData = React__namespace.useCallback(args => mutate(args || {
    domain,
    types,
    value
  }), [domain, types, value, mutate]);
  const signTypedDataAsync = React__namespace.useCallback(args => mutateAsync(args || {
    domain,
    types,
    value
  }), [domain, types, value, mutateAsync]);
  return {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    reset,
    signTypedData,
    signTypedDataAsync,
    status,
    variables
  };
}

const useContract = _ref => {
  let {
    addressOrName,
    contractInterface,
    signerOrProvider
  } = _ref;
  return React__namespace.useMemo(() => {
    return core.getContract({
      addressOrName,
      contractInterface,
      signerOrProvider
    });
  }, [addressOrName, contractInterface, signerOrProvider]);
};

const useContractEvent = function (contractConfig, eventName, listener) {
  let {
    chainId,
    once
  } = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  const provider = useProvider({
    chainId
  });
  const webSocketProvider = useWebSocketProvider({
    chainId
  });
  const contract = useContract({
    signerOrProvider: webSocketProvider !== null && webSocketProvider !== void 0 ? webSocketProvider : provider,
    ...contractConfig
  });
  const listenerRef = React__namespace.useRef(listener);
  listenerRef.current = listener;
  React__namespace.useEffect(() => {
    const handler = function () {
      for (var _len = arguments.length, event = new Array(_len), _key = 0; _key < _len; _key++) {
        event[_key] = arguments[_key];
      }

      return listenerRef.current(event);
    };

    const contract_ = contract;
    if (once) contract_.once(eventName, handler);else contract_.on(eventName, handler);
    return () => {
      contract_.off(eventName, handler);
    }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, eventName]);
};

const queryKey$6 = _ref => {
  let [contractConfig, functionName, {
    args,
    chainId,
    overrides
  }, {
    blockNumber
  }] = _ref;
  return [{
    entity: 'readContract',
    args,
    blockNumber,
    chainId,
    contractConfig,
    functionName,
    overrides
  }];
};

const queryFn$6 = _ref2 => {
  let {
    queryKey: [{
      args,
      chainId,
      contractConfig,
      functionName,
      overrides
    }]
  } = _ref2;
  return core.readContract(contractConfig, functionName, {
    args,
    chainId,
    overrides
  });
};

function useContractRead(contractConfig, functionName) {
  let {
    args,
    chainId: chainId_,
    overrides,
    cacheOnBlock = false,
    cacheTime,
    enabled: enabled_ = true,
    staleTime,
    suspense,
    watch,
    onError,
    onSettled,
    onSuccess
  } = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const chainId = useChainId({
    chainId: chainId_
  });
  const {
    data: blockNumber
  } = useBlockNumber({
    enabled: watch || cacheOnBlock,
    watch
  });
  const queryKey_ = React__namespace.useMemo(() => queryKey$6([contractConfig, functionName, {
    args,
    chainId,
    overrides
  }, {
    blockNumber: cacheOnBlock ? blockNumber : undefined
  }]), [args, blockNumber, cacheOnBlock, chainId, contractConfig, functionName, overrides]);
  const enabled = React__namespace.useMemo(() => {
    let enabled = Boolean(enabled_ && contractConfig && functionName);
    if (cacheOnBlock) enabled = Boolean(enabled && blockNumber);
    return enabled;
  }, [blockNumber, cacheOnBlock, contractConfig, enabled_, functionName]);
  const client = reactQuery.useQueryClient();
  React__namespace.useEffect(() => {
    if (enabled) {
      const unwatch = core.watchReadContract(contractConfig, functionName, {
        args,
        chainId,
        overrides,
        listenToBlock: watch && !cacheOnBlock
      }, result => client.setQueryData(queryKey_, result));
      return unwatch;
    }
  }, [args, cacheOnBlock, chainId, client, contractConfig, enabled, functionName, overrides, queryKey_, watch]);
  return useQuery(queryKey_, queryFn$6, {
    cacheTime,
    enabled,
    staleTime,
    suspense,
    onError,
    onSettled,
    onSuccess
  });
}

const mutationKey$1 = _ref => {
  let [contractConfig, functionName, {
    args,
    overrides
  }] = _ref;
  return [{
    entity: 'writeContract',
    args,
    contractConfig,
    functionName,
    overrides
  }];
};
function useContractWrite(contractConfig, functionName) {
  let {
    args,
    overrides,
    onError,
    onMutate,
    onSettled,
    onSuccess
  } = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    mutate,
    mutateAsync,
    reset,
    status,
    variables
  } = reactQuery.useMutation(mutationKey$1([contractConfig, functionName, {
    args,
    overrides
  }]), _ref2 => {
    let {
      args,
      overrides
    } = _ref2;
    return core.writeContract(contractConfig, functionName, {
      args,
      overrides
    });
  }, {
    onError,
    onMutate,
    onSettled,
    onSuccess
  });
  const write = React__namespace.useCallback(overrideConfig => mutate(overrideConfig || {
    args,
    overrides
  }), [args, mutate, overrides]);
  const writeAsync = React__namespace.useCallback(overrideConfig => mutateAsync(overrideConfig || {
    args,
    overrides
  }), [args, mutateAsync, overrides]);
  return {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    reset,
    status,
    variables,
    write,
    writeAsync
  };
}

const queryKey$5 = _ref => {
  let {
    address,
    chainId,
    formatUnits
  } = _ref;
  return [{
    entity: 'token',
    address,
    chainId,
    formatUnits
  }];
};

const queryFn$5 = _ref2 => {
  let {
    queryKey: [{
      address,
      chainId,
      formatUnits
    }]
  } = _ref2;
  if (!address) throw new Error('address is required');
  return core.fetchToken({
    address,
    chainId,
    formatUnits
  });
};

function useToken() {
  let {
    address,
    chainId: chainId_,
    formatUnits = 'ether',
    cacheTime,
    enabled = true,
    staleTime = 1000 * 60 * 60 * 24,
    // 24 hours
    suspense,
    onError,
    onSettled,
    onSuccess
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const chainId = useChainId({
    chainId: chainId_
  });
  return useQuery(queryKey$5({
    address,
    chainId,
    formatUnits
  }), queryFn$5, {
    cacheTime,
    enabled: Boolean(enabled && address),
    staleTime,
    suspense,
    onError,
    onSettled,
    onSuccess
  });
}

const queryKey$4 = _ref => {
  let {
    chainId,
    name
  } = _ref;
  return [{
    entity: 'ensAddress',
    chainId,
    name
  }];
};

const queryFn$4 = _ref2 => {
  let {
    queryKey: [{
      chainId,
      name
    }]
  } = _ref2;
  if (!name) throw new Error('name is required');
  return core.fetchEnsAddress({
    chainId,
    name
  });
};

function useEnsAddress() {
  let {
    cacheTime,
    chainId: chainId_,
    enabled = true,
    name,
    staleTime = 1000 * 60 * 60 * 24,
    // 24 hours
    suspense,
    onError,
    onSettled,
    onSuccess
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const chainId = useChainId({
    chainId: chainId_
  });
  return useQuery(queryKey$4({
    chainId,
    name
  }), queryFn$4, {
    cacheTime,
    enabled: Boolean(enabled && chainId && name),
    staleTime,
    suspense,
    onError,
    onSettled,
    onSuccess
  });
}

const queryKey$3 = _ref => {
  let {
    addressOrName,
    chainId
  } = _ref;
  return [{
    entity: 'ensAvatar',
    addressOrName,
    chainId
  }];
};

const queryFn$3 = _ref2 => {
  let {
    queryKey: [{
      addressOrName,
      chainId
    }]
  } = _ref2;
  if (!addressOrName) throw new Error('addressOrName is required');
  return core.fetchEnsAvatar({
    addressOrName,
    chainId
  });
};

function useEnsAvatar() {
  let {
    addressOrName,
    cacheTime,
    chainId: chainId_,
    enabled = true,
    staleTime = 1000 * 60 * 60 * 24,
    // 24 hours
    suspense,
    onError,
    onSettled,
    onSuccess
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const chainId = useChainId({
    chainId: chainId_
  });
  return useQuery(queryKey$3({
    addressOrName,
    chainId
  }), queryFn$3, {
    cacheTime,
    enabled: Boolean(enabled && addressOrName && chainId),
    staleTime,
    suspense,
    onError,
    onSettled,
    onSuccess
  });
}

const queryKey$2 = _ref => {
  let {
    address,
    chainId
  } = _ref;
  return [{
    entity: 'ensName',
    address,
    chainId
  }];
};

const queryFn$2 = _ref2 => {
  let {
    queryKey: [{
      address
    }]
  } = _ref2;
  if (!address) throw new Error('address is required');
  return core.fetchEnsName({
    address
  });
};

function useEnsName() {
  let {
    address,
    cacheTime,
    chainId: chainId_,
    enabled = true,
    staleTime = 1000 * 60 * 60 * 24,
    // 24 hours
    suspense,
    onError,
    onSettled,
    onSuccess
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const chainId = useChainId({
    chainId: chainId_
  });
  return useQuery(queryKey$2({
    address,
    chainId
  }), queryFn$2, {
    cacheTime,
    enabled: Boolean(enabled && address && chainId),
    staleTime,
    suspense,
    onError,
    onSettled,
    onSuccess
  });
}

const queryKey$1 = _ref => {
  let {
    chainId,
    name
  } = _ref;
  return [{
    entity: 'ensResolver',
    chainId,
    name
  }];
};

const queryFn$1 = _ref2 => {
  let {
    queryKey: [{
      chainId,
      name
    }]
  } = _ref2;
  if (!name) throw new Error('name is required');
  return core.fetchEnsResolver({
    chainId,
    name
  });
};

function useEnsResolver() {
  let {
    cacheTime,
    chainId: chainId_,
    enabled = true,
    name,
    staleTime = 1000 * 60 * 60 * 24,
    // 24 hours
    suspense,
    onError,
    onSettled,
    onSuccess
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const chainId = useChainId({
    chainId: chainId_
  });
  return useQuery(queryKey$1({
    chainId,
    name
  }), queryFn$1, {
    cacheTime,
    enabled: Boolean(enabled && chainId && name),
    staleTime,
    suspense,
    onError,
    onSettled,
    onSuccess
  });
}

const mutationKey = args => [{
  entity: 'sendTransaction',
  ...args
}];

const mutationFn = args => {
  const {
    request
  } = args;
  if (!request) throw new Error('request is required');
  return core.sendTransaction({
    request
  });
};

function useSendTransaction() {
  let {
    request,
    onError,
    onMutate,
    onSettled,
    onSuccess
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    mutate,
    mutateAsync,
    reset,
    status,
    variables
  } = reactQuery.useMutation(mutationKey({
    request
  }), mutationFn, {
    onError,
    onMutate,
    onSettled,
    onSuccess
  });
  const sendTransaction = React__namespace.useCallback(args => mutate(args || {
    request
  }), [mutate, request]);
  const sendTransactionAsync = React__namespace.useCallback(args => mutateAsync(args || {
    request
  }), [mutateAsync, request]);
  return {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    reset,
    sendTransaction,
    sendTransactionAsync,
    status,
    variables
  };
}

const queryKey = _ref => {
  let {
    confirmations,
    chainId,
    hash,
    timeout,
    wait
  } = _ref;
  return [{
    entity: 'waitForTransaction',
    confirmations,
    chainId,
    hash,
    timeout,
    wait
  }];
};

const queryFn = _ref2 => {
  let {
    queryKey: [{
      chainId,
      confirmations,
      hash,
      timeout,
      wait
    }]
  } = _ref2;
  return core.waitForTransaction({
    chainId,
    confirmations,
    hash,
    timeout,
    wait
  });
};

function useWaitForTransaction() {
  let {
    chainId: chainId_,
    confirmations,
    hash,
    timeout,
    wait,
    cacheTime,
    enabled = true,
    staleTime,
    suspense,
    onError,
    onSettled,
    onSuccess
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const chainId = useChainId({
    chainId: chainId_
  });
  return useQuery(queryKey({
    chainId,
    confirmations,
    hash,
    timeout,
    wait
  }), queryFn, {
    cacheTime,
    enabled: Boolean(enabled && (hash || wait)),
    staleTime,
    suspense,
    onError,
    onSettled,
    onSuccess
  });
}

Object.defineProperty(exports, 'AddChainError', {
  enumerable: true,
  get: function () { return core.AddChainError; }
});
Object.defineProperty(exports, 'ChainNotConfiguredError', {
  enumerable: true,
  get: function () { return core.ChainNotConfiguredError; }
});
Object.defineProperty(exports, 'Client', {
  enumerable: true,
  get: function () { return core.Client; }
});
Object.defineProperty(exports, 'Connector', {
  enumerable: true,
  get: function () { return core.Connector; }
});
Object.defineProperty(exports, 'ConnectorAlreadyConnectedError', {
  enumerable: true,
  get: function () { return core.ConnectorAlreadyConnectedError; }
});
Object.defineProperty(exports, 'ConnectorNotFoundError', {
  enumerable: true,
  get: function () { return core.ConnectorNotFoundError; }
});
Object.defineProperty(exports, 'ProviderRpcError', {
  enumerable: true,
  get: function () { return core.ProviderRpcError; }
});
Object.defineProperty(exports, 'ResourceUnavailableError', {
  enumerable: true,
  get: function () { return core.ResourceUnavailableError; }
});
Object.defineProperty(exports, 'RpcError', {
  enumerable: true,
  get: function () { return core.RpcError; }
});
Object.defineProperty(exports, 'SwitchChainError', {
  enumerable: true,
  get: function () { return core.SwitchChainError; }
});
Object.defineProperty(exports, 'SwitchChainNotSupportedError', {
  enumerable: true,
  get: function () { return core.SwitchChainNotSupportedError; }
});
Object.defineProperty(exports, 'UserRejectedRequestError', {
  enumerable: true,
  get: function () { return core.UserRejectedRequestError; }
});
Object.defineProperty(exports, 'WagmiClient', {
  enumerable: true,
  get: function () { return core.WagmiClient; }
});
Object.defineProperty(exports, 'alchemyRpcUrls', {
  enumerable: true,
  get: function () { return core.alchemyRpcUrls; }
});
Object.defineProperty(exports, 'allChains', {
  enumerable: true,
  get: function () { return core.allChains; }
});
Object.defineProperty(exports, 'chain', {
  enumerable: true,
  get: function () { return core.chain; }
});
Object.defineProperty(exports, 'chainId', {
  enumerable: true,
  get: function () { return core.chainId; }
});
Object.defineProperty(exports, 'configureChains', {
  enumerable: true,
  get: function () { return core.configureChains; }
});
Object.defineProperty(exports, 'createStorage', {
  enumerable: true,
  get: function () { return core.createStorage; }
});
Object.defineProperty(exports, 'createWagmiStorage', {
  enumerable: true,
  get: function () { return core.createWagmiStorage; }
});
Object.defineProperty(exports, 'defaultChains', {
  enumerable: true,
  get: function () { return core.defaultChains; }
});
Object.defineProperty(exports, 'defaultL2Chains', {
  enumerable: true,
  get: function () { return core.defaultL2Chains; }
});
Object.defineProperty(exports, 'erc20ABI', {
  enumerable: true,
  get: function () { return core.erc20ABI; }
});
Object.defineProperty(exports, 'erc721ABI', {
  enumerable: true,
  get: function () { return core.erc721ABI; }
});
Object.defineProperty(exports, 'etherscanBlockExplorers', {
  enumerable: true,
  get: function () { return core.etherscanBlockExplorers; }
});
Object.defineProperty(exports, 'infuraRpcUrls', {
  enumerable: true,
  get: function () { return core.infuraRpcUrls; }
});
exports.Provider = Provider;
exports.WagmiProvider = Provider;
exports.createClient = createClient;
exports.createWagmiClient = createClient;
exports.deserialize = deserialize;
exports.serialize = serialize;
exports.useAccount = useAccount;
exports.useBalance = useBalance;
exports.useBlockNumber = useBlockNumber;
exports.useClient = useClient;
exports.useConnect = useConnect;
exports.useContract = useContract;
exports.useContractEvent = useContractEvent;
exports.useContractRead = useContractRead;
exports.useContractWrite = useContractWrite;
exports.useDisconnect = useDisconnect;
exports.useEnsAddress = useEnsAddress;
exports.useEnsAvatar = useEnsAvatar;
exports.useEnsName = useEnsName;
exports.useEnsResolver = useEnsResolver;
exports.useFeeData = useFeeData;
exports.useNetwork = useNetwork;
exports.useProvider = useProvider;
exports.useQuery = useQuery;
exports.useSendTransaction = useSendTransaction;
exports.useSignMessage = useSignMessage;
exports.useSignTypedData = useSignTypedData;
exports.useSigner = useSigner;
exports.useToken = useToken;
exports.useWagmiClient = useClient;
exports.useWaitForTransaction = useWaitForTransaction;
exports.useWebSocketProvider = useWebSocketProvider;

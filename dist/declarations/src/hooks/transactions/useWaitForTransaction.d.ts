import { WaitForTransactionArgs, WaitForTransactionResult } from '@wagmi/core';
import { QueryConfig } from '../../types';
export declare type UseWaitForTransactionArgs = Partial<WaitForTransactionArgs>;
export declare type UseWaitForTransactionConfig = QueryConfig<WaitForTransactionResult, Error>;
export declare const queryKey: ({ confirmations, chainId, hash, timeout, wait, }: Partial<WaitForTransactionArgs>) => readonly [{
    readonly entity: "waitForTransaction";
    readonly confirmations: number | undefined;
    readonly chainId: number | undefined;
    readonly hash: string | undefined;
    readonly timeout: number | undefined;
    readonly wait: ((confirmations?: number | undefined) => Promise<import("@ethersproject/abstract-provider").TransactionReceipt>) | undefined;
}];
export declare function useWaitForTransaction({ chainId: chainId_, confirmations, hash, timeout, wait, cacheTime, enabled, staleTime, suspense, onError, onSettled, onSuccess, }?: UseWaitForTransactionArgs & UseWaitForTransactionConfig): Pick<import("react-query").QueryObserverResult<import("@ethersproject/abstract-provider").TransactionReceipt, Error>, "data" | "error" | "isError" | "isLoading" | "isSuccess" | "isFetched" | "isFetching" | "isRefetching" | "refetch" | "fetchStatus"> & {
    isIdle: boolean;
    status: "error" | "loading" | "success" | "idle";
    internal: Pick<import("react-query").QueryObserverResult<unknown, unknown>, "isLoadingError" | "isRefetchError" | "dataUpdatedAt" | "errorUpdatedAt" | "failureCount" | "isFetchedAfterMount" | "isPaused" | "isPlaceholderData" | "isPreviousData" | "isStale" | "remove">;
};

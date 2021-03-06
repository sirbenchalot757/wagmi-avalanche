import { SendTransactionArgs, SendTransactionResult } from '@wagmi/core';
import { MutationConfig } from '../../types';
export declare type UseSendTransactionArgs = Partial<SendTransactionArgs>;
export declare type UseSendTransactionConfig = MutationConfig<SendTransactionResult, Error, UseSendTransactionArgs>;
export declare const mutationKey: (args: UseSendTransactionArgs) => readonly [{
    readonly request?: import("@ethersproject/abstract-provider").TransactionRequest | undefined;
    readonly entity: "sendTransaction";
}];
export declare function useSendTransaction({ request, onError, onMutate, onSettled, onSuccess, }?: UseSendTransactionArgs & UseSendTransactionConfig): {
    data: import("@ethersproject/abstract-provider").TransactionResponse | undefined;
    error: Error | null;
    isError: boolean;
    isIdle: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    reset: () => void;
    sendTransaction: (args?: SendTransactionArgs | undefined) => void;
    sendTransactionAsync: (args?: SendTransactionArgs | undefined) => Promise<import("@ethersproject/abstract-provider").TransactionResponse>;
    status: "error" | "loading" | "success" | "idle";
    variables: Partial<SendTransactionArgs> | undefined;
};

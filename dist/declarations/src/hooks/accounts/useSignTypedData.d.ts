import { SignTypedDataArgs, SignTypedDataResult } from '@wagmi/core';
import { MutationConfig } from '../../types';
export declare type UseSignTypedDataArgs = Partial<SignTypedDataArgs>;
export declare type UseSignTypedDataConfig = MutationConfig<SignTypedDataResult, Error, SignTypedDataArgs>;
export declare const mutationKey: (args: UseSignTypedDataArgs) => {
    domain?: import("@ethersproject/abstract-signer").TypedDataDomain | undefined;
    types?: Record<string, import("@ethersproject/abstract-signer").TypedDataField[]> | undefined;
    value?: Record<string, any> | undefined;
    entity: string;
}[];
export declare function useSignTypedData({ domain, types, value, onError, onMutate, onSettled, onSuccess, }?: UseSignTypedDataArgs & UseSignTypedDataConfig): {
    data: string | undefined;
    error: Error | null;
    isError: boolean;
    isIdle: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    reset: () => void;
    signTypedData: (args?: SignTypedDataArgs | undefined) => void;
    signTypedDataAsync: (args?: SignTypedDataArgs | undefined) => Promise<string>;
    status: "error" | "loading" | "success" | "idle";
    variables: SignTypedDataArgs | undefined;
};

import { WriteContractArgs, WriteContractConfig, WriteContractResult } from '@wagmi/core';
import { MutationConfig } from '../../types';
export declare type UseContractWriteArgs = Partial<WriteContractConfig>;
export declare type UseContractWriteConfig = MutationConfig<WriteContractResult, Error, UseContractWriteArgs>;
export declare const mutationKey: ([contractConfig, functionName, { args, overrides },]: [WriteContractArgs, string, Partial<WriteContractConfig>]) => readonly [{
    readonly entity: "writeContract";
    readonly args: any;
    readonly contractConfig: import("@wagmi/core").GetContractArgs;
    readonly functionName: string;
    readonly overrides: import("ethers").CallOverrides | undefined;
}];
export declare function useContractWrite(contractConfig: WriteContractArgs, functionName: string, { args, overrides, onError, onMutate, onSettled, onSuccess, }?: UseContractWriteArgs & UseContractWriteConfig): {
    data: import("@ethersproject/abstract-provider").TransactionResponse | undefined;
    error: Error | null;
    isError: boolean;
    isIdle: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    reset: () => void;
    status: "error" | "loading" | "success" | "idle";
    variables: Partial<WriteContractConfig> | undefined;
    write: (overrideConfig?: WriteContractConfig | undefined) => void;
    writeAsync: (overrideConfig?: WriteContractConfig | undefined) => Promise<import("@ethersproject/abstract-provider").TransactionResponse>;
};

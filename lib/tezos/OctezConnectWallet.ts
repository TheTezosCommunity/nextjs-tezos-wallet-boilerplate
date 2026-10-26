/**
 * Taquito WalletProvider adapter for @tezos-x/octez.connect-sdk.
 *
 * Drop-in replacement for @taquito/beacon-wallet that uses the official
 * octez.connect-sdk — the @tezos-x namespace rename of @airgap/beacon-sdk.
 *
 * @see https://docs.tezos.com/dApps/migrating-from-beacon
 */
import {
    getDAppClientInstance,
    DAppClient,
    NetworkType,
    PermissionScope,
    SigningType,
    BeaconEvent,
    type DAppClientOptions,
    type RequestPermissionInput,
    type Network,
} from "@tezos-x/octez.connect-sdk";
import type {
    WalletProvider,
    WalletTransferParams,
    WalletOriginateParams,
    WalletDelegateParams,
    WalletTransferTicketParams,
    WalletStakeParams,
    WalletUnstakeParams,
    WalletFinalizeUnstakeParams,
    WalletIncreasePaidStorageParams,
    WalletRegisterGlobalConstantParams,
} from "@taquito/taquito";
import {
    createTransferOperation,
    createOriginationOperation,
    createSetDelegateOperation,
    createTransferTicketOperation,
    createIncreasePaidStorageOperation,
    createRegisterGlobalConstantOperation,
} from "@taquito/taquito";
import { hex2buf, mergebuf, buf2hex } from "@taquito/utils";

// Re-export commonly used enums so call sites only need one import.
export { NetworkType, PermissionScope, BeaconEvent };
export type { DAppClientOptions, Network };

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class OctezConnectNotInitialized extends Error {
    constructor() {
        super(
            "OctezConnectWallet not initialized: no active account. " +
                "Call requestPermissions() before using the wallet."
        );
        this.name = "OctezConnectNotInitialized";
    }
}

export class MissingRequiredScopes extends Error {
    constructor(missing: PermissionScope[]) {
        super(`Missing required permission scopes: ${missing.join(", ")}`);
        this.name = "MissingRequiredScopes";
    }
}

// ---------------------------------------------------------------------------
// Network builder
// ---------------------------------------------------------------------------

/**
 * Build a Network config for DAppClientOptions.
 *
 * - mainnet: uses NetworkType.MAINNET without an explicit rpcUrl (standard Beacon spec)
 * - shadownet: uses NetworkType.SHADOWNET with explicit rpcUrl so web wallets (Kukai) map correctly
 * - ghostnet / other: uses NetworkType.CUSTOM to avoid PARAMETERS_INVALID_ERROR on wallets
 *   whose internal enum does not recognize the string "ghostnet"
 */
export function buildNetwork(name: string, rpcUrl?: string): Network {
    switch (name.toLowerCase()) {
        case "mainnet":
            return { type: NetworkType.MAINNET };
        case "shadownet":
            return {
                type: NetworkType.SHADOWNET,
                rpcUrl: rpcUrl || "https://rpc.tzkt.io/shadownet",
            };
        case "ghostnet":
            return {
                type: NetworkType.CUSTOM,
                name: "Ghostnet",
                rpcUrl: rpcUrl || "https://ghostnet.ecadinfra.com",
            };
        default:
            return {
                type: NetworkType.CUSTOM,
                name: name.charAt(0).toUpperCase() + name.slice(1),
                rpcUrl,
            };
    }
}

// ---------------------------------------------------------------------------
// Wallet adapter
// ---------------------------------------------------------------------------

type AnyWalletParams =
    | WalletTransferParams
    | WalletStakeParams
    | WalletUnstakeParams
    | WalletFinalizeUnstakeParams
    | WalletOriginateParams
    | WalletDelegateParams
    | WalletIncreasePaidStorageParams
    | WalletTransferTicketParams
    | WalletRegisterGlobalConstantParams;

export class OctezConnectWallet implements WalletProvider {
    public readonly client: DAppClient;

    /**
     * @param options  DAppClient configuration — pass `network: buildNetwork(...)`.
     * @param reset    When true, destroys any existing singleton DAppClient and
     *                 creates a fresh one (use when switching networks).
     */
    constructor(options: DAppClientOptions, reset = false) {
        const clientOptions: DAppClientOptions = {
            ...options,
            featuredWallets:
                options.featuredWallets ??
                (options.network?.type === NetworkType.SHADOWNET
                    ? ["kukai", "temple", "umami", "metamask"]
                    : undefined),
        };
        this.client = getDAppClientInstance(clientOptions, reset);
    }

    // -- Permissions ---------------------------------------------------------

    async requestPermissions(request?: RequestPermissionInput): Promise<void> {
        const req: RequestPermissionInput = request ?? {
            scopes: [PermissionScope.OPERATION_REQUEST, PermissionScope.SIGN],
        };
        await this.client.requestPermissions(req);
    }

    // -- WalletProvider: identity --------------------------------------------

    async getPKH(): Promise<string> {
        const account = await this.client.getActiveAccount();
        if (!account) throw new OctezConnectNotInitialized();
        return account.address;
    }

    async getPK(): Promise<string> {
        const account = await this.client.getActiveAccount();
        if (!account) throw new OctezConnectNotInitialized();
        return account.publicKey ?? "";
    }

    // -- WalletProvider: parameter mapping -----------------------------------

    async mapTransferParamsToWalletParams(params: () => Promise<WalletTransferParams>): Promise<unknown> {
        let walletParams: WalletTransferParams;
        await this.client.showPrepare();
        try {
            walletParams = await params();
        } catch (err) {
            await this.client.hideUI(["alert"]);
            throw err;
        }
        return this.removeDefaultParams(
            walletParams,
            await createTransferOperation(this.formatParameters(walletParams))
        );
    }

    async mapTransferTicketParamsToWalletParams(
        params: () => Promise<WalletTransferTicketParams>
    ): Promise<unknown> {
        let walletParams: WalletTransferTicketParams;
        await this.client.showPrepare();
        try {
            walletParams = await params();
        } catch (err) {
            await this.client.hideUI(["alert"]);
            throw err;
        }
        return this.removeDefaultParams(
            walletParams,
            await createTransferTicketOperation(this.formatParameters(walletParams))
        );
    }

    async mapRegisterGlobalConstantParamsToWalletParams(
        params: () => Promise<WalletRegisterGlobalConstantParams>
    ): Promise<unknown> {
        let walletParams: WalletRegisterGlobalConstantParams;
        await this.client.showPrepare();
        try {
            walletParams = await params();
        } catch (err) {
            await this.client.hideUI(["alert"]);
            throw err;
        }
        return this.removeDefaultParams(
            walletParams,
            await createRegisterGlobalConstantOperation(this.formatParameters(walletParams))
        );
    }

    async mapStakeParamsToWalletParams(params: () => Promise<WalletStakeParams>): Promise<unknown> {
        let walletParams: WalletStakeParams;
        await this.client.showPrepare();
        try {
            walletParams = await params();
        } catch (err) {
            await this.client.hideUI(["alert"]);
            throw err;
        }
        return this.removeDefaultParams(
            walletParams,
            await createTransferOperation(this.formatParameters(walletParams as WalletTransferParams))
        );
    }

    async mapUnstakeParamsToWalletParams(params: () => Promise<WalletUnstakeParams>): Promise<unknown> {
        let walletParams: WalletUnstakeParams;
        await this.client.showPrepare();
        try {
            walletParams = await params();
        } catch (err) {
            await this.client.hideUI(["alert"]);
            throw err;
        }
        return this.removeDefaultParams(
            walletParams,
            await createTransferOperation(this.formatParameters(walletParams as WalletTransferParams))
        );
    }

    async mapFinalizeUnstakeParamsToWalletParams(
        params: () => Promise<WalletFinalizeUnstakeParams>
    ): Promise<unknown> {
        let walletParams: WalletFinalizeUnstakeParams;
        await this.client.showPrepare();
        try {
            walletParams = await params();
        } catch (err) {
            await this.client.hideUI(["alert"]);
            throw err;
        }
        return this.removeDefaultParams(
            walletParams,
            await createTransferOperation(this.formatParameters(walletParams as WalletTransferParams))
        );
    }

    async mapIncreasePaidStorageWalletParams(
        params: () => Promise<WalletIncreasePaidStorageParams>
    ): Promise<unknown> {
        let walletParams: WalletIncreasePaidStorageParams;
        await this.client.showPrepare();
        try {
            walletParams = await params();
        } catch (err) {
            await this.client.hideUI(["alert"]);
            throw err;
        }
        return this.removeDefaultParams(
            walletParams,
            await createIncreasePaidStorageOperation(this.formatParameters(walletParams))
        );
    }

    async mapOriginateParamsToWalletParams(params: () => Promise<WalletOriginateParams>): Promise<unknown> {
        let walletParams: WalletOriginateParams;
        await this.client.showPrepare();
        try {
            walletParams = await params();
        } catch (err) {
            await this.client.hideUI(["alert"]);
            throw err;
        }
        return this.removeDefaultParams(
            walletParams,
            await createOriginationOperation(this.formatParameters(walletParams))
        );
    }

    async mapDelegateParamsToWalletParams(params: () => Promise<WalletDelegateParams>): Promise<unknown> {
        let walletParams: WalletDelegateParams;
        await this.client.showPrepare();
        try {
            walletParams = await params();
        } catch (err) {
            await this.client.hideUI(["alert"]);
            throw err;
        }
        return this.removeDefaultParams(
            walletParams,
            await createSetDelegateOperation(this.formatParameters(walletParams))
        );
    }

    // -- WalletProvider: operations ------------------------------------------

    async sendOperations(params: unknown[]): Promise<string> {
        const account = await this.client.getActiveAccount();
        if (!account) throw new OctezConnectNotInitialized();
        this.validateRequiredScopesOrFail(account.scopes, [PermissionScope.OPERATION_REQUEST]);
        const { transactionHash } = await this.client.requestOperation({
            operationDetails: params as Parameters<DAppClient["requestOperation"]>[0]["operationDetails"],
        });
        return transactionHash;
    }

    // -- WalletProvider: signing ---------------------------------------------

    async sign(bytes: string, watermark?: Uint8Array): Promise<string> {
        let bb = hex2buf(bytes);
        if (watermark !== undefined) {
            bb = mergebuf(watermark, bb);
        }
        const watermarkedBytes = buf2hex(Buffer.from(bb));
        const signingType = this.getSigningType(watermark);
        const { signature } = await this.client.requestSignPayload({
            payload: watermarkedBytes,
            signingType,
        });
        return signature;
    }

    // -- Session management --------------------------------------------------

    /** Remove the active account without destroying the client. */
    async clearActiveAccount(): Promise<void> {
        await this.client.clearActiveAccount();
    }

    /** Destroy the client and release all resources. */
    async disconnect(): Promise<void> {
        await this.client.destroy();
    }

    // -- Private helpers -----------------------------------------------------

    private formatParameters(params: any): any {
        const p = { ...params };
        if (p.fee) p.fee = String(p.fee);
        if (p.storageLimit) p.storageLimit = String(p.storageLimit);
        if (p.gasLimit) p.gasLimit = String(p.gasLimit);
        return p;
    }

    private removeDefaultParams(params: AnyWalletParams, operatedParams: any): any {
        const p = params as Record<string, unknown>;
        if (!p.fee) delete operatedParams.fee;
        if (!p.storageLimit) delete operatedParams.storage_limit;
        if (!p.gasLimit) delete operatedParams.gas_limit;
        return operatedParams;
    }

    private validateRequiredScopesOrFail(
        permissionScopes: PermissionScope[],
        requiredScopes: PermissionScope[]
    ): void {
        const missing = new Set(requiredScopes);
        for (const scope of permissionScopes) {
            missing.delete(scope);
        }
        if (missing.size > 0) {
            throw new MissingRequiredScopes(Array.from(missing));
        }
    }

    private getSigningType(watermark?: Uint8Array): SigningType {
        if (!watermark || watermark.length === 0) return SigningType.RAW;
        if (watermark.length === 1) {
            if (watermark[0] === 5) return SigningType.MICHELINE;
            if (watermark[0] === 3) return SigningType.OPERATION;
        }
        throw new Error(`Invalid watermark: ${JSON.stringify(watermark)}`);
    }
}

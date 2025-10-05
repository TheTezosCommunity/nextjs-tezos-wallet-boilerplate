"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, Play, Upload, Eye, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { useTezos } from "@/lib/tezos/useTezos";
import { smartPyExamples, formatMichelsonParameter, type SmartPyContract } from "@/lib/smartpy-contracts";
import { MichelsonMap } from "@taquito/taquito";

interface SmartContractInteractionProps {
    onSuccess?: (opHash: string, type: "invoke" | "deploy") => void;
    onError?: (error: Error) => void;
}

export function SmartContractInteraction({ onSuccess, onError }: SmartContractInteractionProps) {
    const { Tezos: tezos } = useTezos();
    const isInitialized = !!tezos;
    const [contractAddress, setContractAddress] = useState("");
    const [entrypoint, setEntrypoint] = useState("");
    const [parameters, setParameters] = useState("");
    const [contractCode, setContractCode] = useState("");
    const [contractStorage, setContractStorage] = useState("");
    const [availableEntrypoints, setAvailableEntrypoints] = useState<string[]>([]);
    const [currentStorage, setCurrentStorage] = useState<unknown>(null);
    const [loading, setLoading] = useState(false);
    const [storageLoading, setStorageLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState<SmartPyContract | null>(null);
    const [deployMode, setDeployMode] = useState<"template" | "custom">("template");

    // Sample contract data for Ghostnet
    const sampleContracts = [
        {
            name: "Smartpy template",
            address: "KT1CnV3hoCSPrDcRGnvfnyFgyZUejS2S5s7w",
            entrypoints: ["double"],
        },
        {
            name: "NFT Marketplace",
            address: "KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn",
            entrypoints: ["sell", "buy", "cancel", "update_price"],
        },
        {
            name: "Simple Storage",
            address: "KT1TezoooozzSmartPyzzSTATiCzzzwwBFA1",
            entrypoints: ["increment", "decrement", "reset"],
        },
    ];

    const loadContractInfo = async (address: string) => {
        if (!tezos || !address || !address.startsWith("KT1")) return;

        setStorageLoading(true);
        setError("");

        try {
            const contract = await tezos.contract.at(address);
            const methods = Object.keys(contract.methods);
            setAvailableEntrypoints(methods);

            // Load current storage
            const storage = await contract.storage();
            setCurrentStorage(storage);
        } catch (err: unknown) {
            console.error("Failed to load contract info:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to load contract";
            setError(errorMessage);
        } finally {
            setStorageLoading(false);
        }
    };

    const handleContractSelect = (address: string) => {
        setContractAddress(address);
        setEntrypoint("");

        // Set sample entrypoints for known contracts
        const sample = sampleContracts.find((c) => c.address === address);
        if (sample) {
            setAvailableEntrypoints(sample.entrypoints);
        } else {
            // Load real contract info
            loadContractInfo(address);
        }
    };

    const handleInvoke = async () => {
        if (!tezos || !contractAddress || !entrypoint) {
            setError("Please fill in all required fields");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const contract = await tezos.wallet.at(contractAddress);

            let parsedParams: unknown;
            if (parameters.trim()) {
                try {
                    parsedParams = JSON.parse(parameters);
                } catch (_parseErr) {
                    throw new Error("Invalid JSON parameters");
                }
            }

            const operation = parsedParams
                ? await contract.methods[entrypoint](parsedParams).send()
                : await contract.methods[entrypoint]().send();

            console.log("Contract invocation operation:", operation.opHash);

            // Wait for confirmation
            await operation.confirmation();

            setSuccess(`Contract called successfully! Operation: ${operation.opHash}`);
            onSuccess?.(operation.opHash, "invoke");

            // Reload storage to show updated state
            setTimeout(() => loadContractInfo(contractAddress), 2000);
        } catch (err: unknown) {
            console.error("Contract invocation failed:", err);
            const errorMessage = err instanceof Error ? err.message : "Contract invocation failed";
            setError(errorMessage);
            onError?.(new Error(errorMessage));
        } finally {
            setLoading(false);
        }
    };

    const handleDeploy = async () => {
        if (!tezos) {
            setError("Wallet not connected");
            return;
        }

        let codeToUse = contractCode;
        let storageToUse = contractStorage;

        // Use template if selected
        if (deployMode === "template" && selectedTemplate) {
            codeToUse = JSON.stringify(selectedTemplate.code);
            storageToUse = typeof selectedTemplate.initialStorage === 'object'
                ? JSON.stringify(selectedTemplate.initialStorage)
                : String(selectedTemplate.initialStorage);
        }

        if (!codeToUse || !storageToUse) {
            setError("Please provide both contract code and initial storage");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let parsedCode: any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let parsedStorage: any;

            try {
                parsedCode = typeof codeToUse === "string" ? JSON.parse(codeToUse) : codeToUse;
            } catch {
                throw new Error("Invalid contract code format");
            }

            try {
                if (deployMode === "template" && selectedTemplate) {
                    parsedStorage = selectedTemplate.initialStorage;
                } else {
                    parsedStorage = JSON.parse(storageToUse);
                }
            } catch {
                // Try as literal value for simple storage
                parsedStorage = storageToUse;
            }

            const operation = await tezos.wallet
                .originate({
                    code: parsedCode,
                    storage: parsedStorage,
                })
                .send();

            console.log("Contract deployment operation:", operation.opHash);

            // Wait for confirmation
            const contract = await operation.contract();

            setSuccess(`Contract deployed successfully! Address: ${contract.address}`);
            setContractAddress(contract.address);
            onSuccess?.(operation.opHash, "deploy");
        } catch (err: unknown) {
            console.error("Contract deployment failed:", err);
            const errorMessage = err instanceof Error ? err.message : "Contract deployment failed";
            setError(errorMessage);
            onError?.(new Error(errorMessage));
        } finally {
            setLoading(false);
        }
    };

    const loadTemplate = (template: SmartPyContract) => {
        setSelectedTemplate(template);
        setContractCode(JSON.stringify(template.code, null, 2));
        setContractStorage(
            typeof template.initialStorage === 'object'
                ? JSON.stringify(template.initialStorage)
                : String(template.initialStorage)
        );
        setAvailableEntrypoints(template.entrypoints.map((ep) => ep.name));
    };

    const formatStorage = (storage: unknown): string => {
        if (typeof storage === "object") {
            return JSON.stringify(storage, null, 2);
        }
        return String(storage);
    };

    if (!isInitialized) {
        return (
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Play className="h-5 w-5" />
                        Smart Contract Interaction
                    </CardTitle>
                    <CardDescription>Call contract methods, view storage, and deploy new contracts</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-40">
                        <p className="text-muted-foreground">Initializing wallet...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Smart Contract Interaction
                </CardTitle>
                <CardDescription>Call contract methods, view storage, and deploy new contracts</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="invoke">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="invoke">Call Method</TabsTrigger>
                        <TabsTrigger value="storage">View Storage</TabsTrigger>
                        <TabsTrigger value="deploy">Deploy</TabsTrigger>
                    </TabsList>

                    <TabsContent value="invoke" className="space-y-4 pt-4">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="contract-address">Contract Address</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="contract-address"
                                        placeholder="KT1..."
                                        value={contractAddress}
                                        onChange={(e) => setContractAddress(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Select onValueChange={handleContractSelect}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Sample contracts" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sampleContracts.map((contract) => (
                                                <SelectItem key={contract.address} value={contract.address}>
                                                    {contract.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="entrypoint">Entry Point</Label>
                                <Select value={entrypoint} onValueChange={setEntrypoint}>
                                    <SelectTrigger id="entrypoint">
                                        <SelectValue placeholder="Select entry point" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableEntrypoints.map((ep) => (
                                            <SelectItem key={ep} value={ep}>
                                                {ep}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="parameters">Parameters (JSON)</Label>
                                <Textarea
                                    id="parameters"
                                    placeholder='{"to": "tz1...", "amount": 100}'
                                    value={parameters}
                                    onChange={(e) => setParameters(e.target.value)}
                                    className="font-mono text-sm"
                                    rows={5}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Leave empty for methods with no parameters
                                </p>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {success && (
                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription>{success}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                onClick={handleInvoke}
                                disabled={loading || !contractAddress || !entrypoint}
                                className="gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Calling Contract...
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-4 w-4" />
                                        Call Contract
                                    </>
                                )}
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="storage" className="space-y-4 pt-4">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="storage-address">Contract Address</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="storage-address"
                                        placeholder="KT1..."
                                        value={contractAddress}
                                        onChange={(e) => setContractAddress(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => loadContractInfo(contractAddress)}
                                        disabled={storageLoading}
                                    >
                                        {storageLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Eye className="h-4 w-4 mr-2" />
                                                Load
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {currentStorage !== null && (
                                <div className="grid gap-2">
                                    <Label>Contract Storage</Label>
                                    <div className="border rounded-md p-3 bg-muted font-mono text-sm overflow-auto max-h-96">
                                        <pre>{formatStorage(currentStorage)}</pre>
                                    </div>
                                </div>
                            )}

                            {availableEntrypoints.length > 0 && (
                                <div className="grid gap-2">
                                    <Label>Available Entry Points</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableEntrypoints.map((method) => (
                                            <span
                                                key={method}
                                                className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm font-mono"
                                            >
                                                {method}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="deploy" className="space-y-4 pt-4">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label>Deployment Mode</Label>
                                <Select
                                    value={deployMode}
                                    onValueChange={(value: "template" | "custom") => setDeployMode(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="template">SmartPy Templates</SelectItem>
                                        <SelectItem value="custom">Custom Michelson</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {deployMode === "template" && (
                                <div className="grid gap-2">
                                    <Label>SmartPy Contract Template</Label>
                                    <Select
                                        onValueChange={(value) => {
                                            const template = smartPyExamples.find((t) => t.name === value);
                                            if (template) loadTemplate(template);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {smartPyExamples.map((template) => (
                                                <SelectItem key={template.name} value={template.name}>
                                                    <div className="space-y-1">
                                                        <div className="font-medium">{template.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {template.description}
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {selectedTemplate && deployMode === "template" && (
                                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                                    <h4 className="font-semibold">{selectedTemplate.name}</h4>
                                    <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Available Entry Points:</Label>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedTemplate.entrypoints.map((ep) => (
                                                <span
                                                    key={ep.name}
                                                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                                                >
                                                    {ep.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-xs">
                                        <span className="font-medium">Initial Storage:</span>{" "}
                                        {JSON.stringify(selectedTemplate.initialStorage)}
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="contract-code">Contract Code (Michelson JSON)</Label>
                                <Textarea
                                    id="contract-code"
                                    placeholder={
                                        deployMode === "template"
                                            ? "Select a template above"
                                            : "parameter unit; storage int; code { CDR; NIL operation; PAIR };"
                                    }
                                    value={contractCode}
                                    onChange={(e) => setContractCode(e.target.value)}
                                    className="font-mono text-sm"
                                    rows={6}
                                    disabled={deployMode === "template"}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="initial-storage">Initial Storage</Label>
                                <Textarea
                                    id="initial-storage"
                                    placeholder={deployMode === "template" ? "Auto-filled from template" : "0"}
                                    value={contractStorage}
                                    onChange={(e) => setContractStorage(e.target.value)}
                                    className="font-mono text-sm"
                                    rows={2}
                                    disabled={deployMode === "template"}
                                />
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {success && (
                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription>{success}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                onClick={handleDeploy}
                                disabled={loading || (!contractCode && !selectedTemplate)}
                                className="gap-2 w-full"
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Deploying Contract...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4" />
                                        Deploy{" "}
                                        {deployMode === "template" && selectedTemplate
                                            ? selectedTemplate.name
                                            : "Contract"}
                                    </>
                                )}
                            </Button>

                            {deployMode === "template" && (
                                <div className="text-xs text-muted-foreground">
                                    💡 Templates are pre-compiled SmartPy contracts ready for deployment on Ghostnet
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

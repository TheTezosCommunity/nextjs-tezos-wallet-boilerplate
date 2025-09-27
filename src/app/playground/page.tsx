import { ContractPlayground } from "@/components/contract-playground";

export default function PlaygroundPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-8">
                <ContractPlayground />
            </div>
        </div>
    );
}

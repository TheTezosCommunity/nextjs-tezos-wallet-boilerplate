export interface ApiTableProps {
    rows: [string, string][];
}

export function ApiTable({ rows }: ApiTableProps) {
    return (
        <table className="w-full text-sm border-collapse border rounded-lg overflow-hidden">
            <tbody>
                {rows.map(([name, desc]) => (
                    <tr key={name}>
                        <td className="font-mono px-2 py-1 border-b bg-muted-foreground/5 whitespace-nowrap">{name}</td>
                        <td className="px-2 py-1 border-b">{desc}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

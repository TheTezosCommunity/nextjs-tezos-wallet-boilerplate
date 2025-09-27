export interface ExampleProps {
    title?: string;
    children: React.ReactNode;
}

export function Example({ title, children }: ExampleProps) {
    return (
        <section className="my-6">
            {title && <h3 className="mb-2 text-lg font-semibold">{title}</h3>}
            <div className="rounded border bg-muted/30 p-4">{children}</div>
        </section>
    );
}

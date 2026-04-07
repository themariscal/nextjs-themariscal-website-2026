import { generateHeadingId } from "@/lib/utils"

export const markdownComponents = {
    p: ({ children, ...props }: any) => (
        <p className="mb-4 text-foreground leading-relaxed" {...props}>
            {children}
        </p>
    ),
    h1: ({ children, ...props }: any) => {
        const id = generateHeadingId(children?.toString() || '')
        return (
            <h1 id={id} className="text-3xl font-bold text-foreground mb-6 mt-8 first:mt-0" {...props}>
                {children}
            </h1>
        )
    },
    h2: ({ children, ...props }: any) => {
        const id = generateHeadingId(children?.toString() || '')
        return (
            <h2 id={id} className="text-2xl font-semibold text-foreground mb-4 mt-8" {...props}>
                {children}
            </h2>
        )
    },
    h3: ({ children, ...props }: any) => {
        const id = generateHeadingId(children?.toString() || '')
        return (
            <h3 id={id} className="text-xl font-semibold text-foreground mb-3 mt-6" {...props}>
                {children}
            </h3>
        )
    },
    strong: ({ children, ...props }: any) => (
        <strong className="font-semibold text-primary" {...props}>
            {children}
        </strong>
    ),
    ul: ({ children, ...props }: any) => (
        <ul className="list-disc list-inside mb-4 space-y-2 text-foreground" {...props}>
            {children}
        </ul>
    ),
    ol: ({ children, ...props }: any) => (
        <ol className="list-decimal list-inside mb-4 space-y-2 text-foreground" {...props}>
            {children}
        </ol>
    ),
    li: ({ children, ...props }: any) => (
        <li className="text-foreground" {...props}>
            {children}
        </li>
    ),
    blockquote: ({ children, ...props }: any) => (
        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4" {...props}>
            {children}
        </blockquote>
    ),
    code: ({ children, ...props }: any) => (
        <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground" {...props}>
            {children}
        </code>
    ),
    pre: ({ children, ...props }: any) => (
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4" {...props}>
            {children}
        </pre>
    ),

    h4: ({ children, ...props }: any) => {
        const id = generateHeadingId(children?.toString() || '')
        return (
            <h4
                id={id}
                className="text-lg font-semibold text-foreground mb-2 mt-4"
                {...props}
            >
                {children}
            </h4>
        )
    },
    h5: ({ children, ...props }: any) => {
        const id = generateHeadingId(children?.toString() || '')
        return (
            <h5
                id={id}
                className="text-base font-semibold text-foreground mb-2 mt-4"
                {...props}
            >
                {children}
            </h5>
        )
    },
    h6: ({ children, ...props }: any) => {
        const id = generateHeadingId(children?.toString() || '')
        return (
            <h6
                id={id}
                className="text-sm font-semibold text-foreground mb-2 mt-4"
                {...props}
            >
                {children}
            </h6>
        )
    }

}
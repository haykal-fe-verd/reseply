export function EnvironmentLabel() {
    if (process.env.NODE_ENV !== "development") return null;

    return <div className="app-environment-label uppercase">{process.env.NODE_ENV}</div>;
}

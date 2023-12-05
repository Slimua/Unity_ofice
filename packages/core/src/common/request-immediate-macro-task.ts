export function requestImmediateMacroTask(callback: (value?: unknown) => void): () => void {
    const channel = new MessageChannel();
    let cancelled = false;

    channel.port1.onmessage = () => {
        if (!cancelled) {
            callback();
        }
    };

    channel.port2.postMessage(null);

    return () => {
        cancelled = true;
    };
}

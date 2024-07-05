export function throttle(fn: Function, delay: number) {
    let timer: number | null = null;
    return (...args: any) => {
        if (timer) return;
        timer = setTimeout(() => {
            fn(...args);
            timer = null;
        }, delay);
    };
}

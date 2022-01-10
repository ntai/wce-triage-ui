


export function isPromise( maybe: any) {
    return maybe && Object.prototype.toString.call(maybe) === "[object Promise]";
}

type Handler<T> = (payload: T) => void;

class Emitter {
  private map = new Map<string, Set<Handler<any>>>();
  on<T>(evt: string, fn: Handler<T>) {
    if (!this.map.has(evt)) this.map.set(evt, new Set());
    // @ts-ignore
    this.map.get(evt)!.add(fn);
    return () => this.off(evt, fn);
  }
  off<T>(evt: string, fn: Handler<T>) {
    this.map.get(evt)?.delete(fn as any);
  }
  emit<T>(evt: string, payload: T) {
    this.map.get(evt)?.forEach((fn) => {
      try { (fn as Handler<T>)(payload); } catch {}
    });
  }
}

export const events = new Emitter();


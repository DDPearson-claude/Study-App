// Universal stub used by `node build.mjs --stub=...` / `--only=...`.
// Every property access and call returns the same harmless stub, so modules
// under test can run while their neighbours are absent.
function makeStub(label) {
  const fn = function () { return stub; };
  const stub = new Proxy(fn, {
    get(_t, prop) {
      if (prop === Symbol.toPrimitive) return () => 0;
      if (prop === 'then') return undefined; // not a thenable
      if (prop === Symbol.iterator) return function* () {};
      if (prop === 'toString' || prop === 'valueOf') return () => (prop === 'toString' ? `[stub ${label}]` : 0);
      if (prop === 'isStub') return true;
      return stub;
    },
    apply() { return stub; },
    construct() { return stub; },
    set() { return true; },
  });
  return stub;
}
export function create() { return makeStub('module'); }
export default { create };

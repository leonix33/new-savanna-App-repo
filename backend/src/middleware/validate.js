export const validate = (schema) => (req, _res, next) => {
  const parsed = schema.parse({
    body: req.body,
    params: req.params,
    query: req.query
  });
  req.body = parsed.body ?? req.body;
  req.params = parsed.params ?? req.params;
  if (parsed.query !== undefined) {
    Object.defineProperty(req, 'query', {
      value: parsed.query,
      writable: true,
      enumerable: true,
      configurable: true
    });
  }
  next();
};

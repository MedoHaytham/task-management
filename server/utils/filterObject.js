// Keep only the allowed fields from a request body,
// preventing users from injecting fields like `role`, `owner`, or `creator`
exports.filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};
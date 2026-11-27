// src/modules/applications/validateFormData.js
// Checks a citizen's answers (formData) against a service's form_schema v1.
// Returns { errors, clean }:
//   errors = list of messages (empty when everything is fine)
//   clean  = only the answers we keep (hidden and unknown fields removed)

// Is the answer missing? (nothing, empty text or an empty list)
const isEmpty = (v) =>
  v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0);

// Today as "YYYY-MM-DD", so dates can be compared as text
const today = () => new Date().toISOString().slice(0, 10);

// showIf: only show (and only require) a field when another answer matches
const isShown = (field, answers) => !field.showIf || answers[field.showIf.field] === field.showIf.equals;

// Check one field. Returns an error message, or null if it's fine.
function checkField(field, value, answers) {
  const rules = field.validation || {};
  const label = field.label;

  if (isEmpty(value)) return field.required ? `${label} is required` : null;

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'email':
    case 'tel':
    case 'url':
      if (typeof value !== 'string') return `${label} must be text`;
      if (rules.minLength && value.trim().length < rules.minLength) return `${label} must be at least ${rules.minLength} characters`;
      if (rules.maxLength && value.length > rules.maxLength) return `${label} must be at most ${rules.maxLength} characters`;
      if (rules.maxWords && value.trim().split(/\s+/).length > rules.maxWords) return `${label} must be at most ${rules.maxWords} words`;
      if (rules.pattern && !new RegExp(rules.pattern).test(value)) return rules.patternMessage || `${label} is not in the right format`;
      return null;

    case 'number': {
      const n = Number(value);
      if (!Number.isFinite(n)) return `${label} must be a number`;
      const max = rules.max === 'currentYear' ? new Date().getFullYear() : rules.max;
      if (rules.min !== undefined && n < rules.min) return `${label} must be at least ${rules.min}`;
      if (max !== undefined && n > max) return `${label} must be at most ${max}`;
      return null;
    }

    case 'date': {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${label} must be a date like 2026-12-31`;
      const min = rules.min === 'today' ? today() : rules.min;
      const max = rules.max === 'today' ? today() : rules.max;
      if (min && value < min) return `${label} can't be before ${min}`;
      if (max && value > max) return `${label} can't be after ${max}`;
      if (rules.notBefore && answers[rules.notBefore] && value < answers[rules.notBefore]) return `${label} can't be before the start date`;
      return null;
    }

    case 'time':
      return /^\d{2}:\d{2}$/.test(value) ? null : `${label} must be a time like 14:30`;

    case 'select':
    case 'choice': {
      const allowed = (field.options || []).map((o) => o.value);
      if (!allowed.includes(value)) return `${label} has an answer that isn't one of the options`;
      if (rules.mustBe !== undefined && value !== rules.mustBe) return rules.mustBeMessage || `${label} must be ${rules.mustBe}`;
      return null;
    }

    case 'checkbox':
      return typeof value === 'boolean' ? null : `${label} must be ticked or not ticked`;

    case 'repeater': {
      if (!Array.isArray(value)) return `${label} must be a list`;
      if (rules.minItems && value.length < rules.minItems) return `${label} needs at least ${rules.minItems} rows`;
      if (rules.maxItems && value.length > rules.maxItems) return `${label} can have at most ${rules.maxItems} rows`;
      for (const [i, row] of value.entries()) {
        for (const sub of field.fields || []) {
          const err = checkField(sub, row?.[sub.name], row || {});
          if (err) return `${label}, row ${i + 1}: ${err}`;
        }
      }
      return null;
    }

    default:
      return null;
  }
}

module.exports = function validateFormData(schema, formData) {
  const answers = formData && typeof formData === 'object' ? formData : {};
  const fields = (schema.steps || []).flatMap((step) => step.fields);
  const known = new Set(fields.map((f) => f.name));
  const errors = [];
  const clean = {};

  // Rule 3 in form-schemas/README.md: unknown field names are rejected
  for (const name of Object.keys(answers)) {
    if (!known.has(name)) errors.push(`Unknown field: ${name}`);
  }

  for (const field of fields) {
    if (!isShown(field, answers)) continue; // hidden: not required, and its answer is dropped
    // TEMPORARY: file uploads come later, so file fields are not checked yet (open question in API.md)
    if (field.type === 'file') continue;

    const err = checkField(field, answers[field.name], answers);
    if (err) errors.push(err);
    else if (!isEmpty(answers[field.name])) clean[field.name] = answers[field.name];
  }

  return { errors, clean };
};
// src/modules/applications/applications.service.js
// The rules for applications. No req/res here: only data and decisions.
const prisma = require('../../config/db');
const AppError = require('../../utils/AppError');
const nextReference = require('../../utils/reference');
const validateFormData = require('./validateFormData');

// Work out the fee in kwacha.
// A service with feeRules (the event permit) charges by an answer; feeRules amounts are in ngwee.
function feeFor(service, answers) {
  const rules = service.formSchema.feeRules;
  if (!rules) return Number(service.fee);
  const amount = rules.amounts?.[answers[rules.field]];
  if (amount === undefined || amount === null) return Number(service.fee);
  return rules.unit === 'ngwee' ? amount / 100 : amount;
}

exports.create = async ({ userId, serviceSlug, formData }) => {
  // 1. The service must exist and be published
  if (!serviceSlug) throw new AppError(400, 'serviceSlug is required');
  const service = await prisma.service.findUnique({ where: { slug: serviceSlug } });
  if (!service || !service.isPublished) throw new AppError(404, 'Service not found');

  // 2. Check the answers against the service's form
  const schema = service.formSchema;
  const { errors, clean } = validateFormData(schema, formData);
  if (errors.length > 0) throw new AppError(400, errors[0]);

  // 3. "requires": e.g. a grant needs an approved artist registration first
  if (schema.requires) {
    const held = await prisma.application.findFirst({
      where: { userId, status: schema.requires.status, service: { slug: schema.requires.service } },
    });
    if (!held) throw new AppError(403, schema.requires.message);
  }

  // 4. Save the application, its first history row and (if there's a fee) a pending payment.
  //    One nested create = one transaction: all rows are saved, or none.
  const fee = feeFor(service, clean);
  const referenceNo = await nextReference();
  const application = await prisma.application.create({
    data: {
      referenceNo,
      userId,
      serviceId: service.id,
      formData: clean,
      status: 'SUBMITTED',
      currentStep: 1,
      history: { create: { action: 'SUBMITTED', actorId: userId } },
      ...(fee > 0 && { payments: { create: { amount: fee } } }),
    },
  });

  return {
    id: application.id,
    referenceNo: application.referenceNo,
    status: application.status,
    currentStep: application.currentStep,
    fee: String(fee),
  };
};
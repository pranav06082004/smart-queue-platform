type QueueInput = { name?: unknown; serviceId?: unknown };

export function validateQueueInput(body: QueueInput) {
  const errors: string[] = [];
  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    errors.push("Queue name is required.");
  }
  if (typeof body.serviceId !== "string" || body.serviceId.trim().length === 0) {
    errors.push("serviceId is required.");
  }
  return errors;
}
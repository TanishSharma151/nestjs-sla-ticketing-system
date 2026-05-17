export function calculateSlaDueDate(
  resolutionHours: number,
): Date {
  const dueDate = new Date();

  dueDate.setHours(
    dueDate.getHours() + resolutionHours,
  );

  return dueDate;
}
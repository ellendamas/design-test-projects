export function trackStep(stepName: string, properties?: Record<string, unknown>) {
  if (properties) {
    console.log(`[analytics] step: ${stepName}`, properties);
  } else {
    console.log(`[analytics] step: ${stepName}`);
  }
  // amplitude.track(stepName, properties)
}

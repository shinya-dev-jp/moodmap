export function track(event: string, _props?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.log("[track]", event, _props);
  }
}

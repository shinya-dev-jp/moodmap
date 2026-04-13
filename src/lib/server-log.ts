type LogLevel = "info" | "warn" | "error";
interface LogContext { [key: string]: unknown; }

function emit(level: LogLevel, source: string, message: string, ctx?: LogContext) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, source, message, ...ctx }).slice(0, 4000);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logInfo  = (s: string, m: string, c?: LogContext) => emit("info",  s, m, c);
export const logWarn  = (s: string, m: string, c?: LogContext) => emit("warn",  s, m, c);
export const logError = (s: string, m: string, c?: LogContext) => emit("error", s, m, c);

export type EventError =
  | "unhandledRejection"
  | "uncaughtException"
  | "uncaughtExceptionMonitor"
  | "multipleResolves";

export function handleErrors(
  errors: EventError | EventError[],
  prefix: string
): void {
  const errs = Array.isArray(errors) ? errors : [errors];

  for (const error of errs) {
    if (error === "multipleResolves") {
      process.on(error, (type, prom, origin) => {
        console.log(`${prefix}Multiple Resolves`);
        console.log(type, prom, origin);
      });
    } else if (error === "uncaughtException") {
      process.on(error, (err, origin) => {
        console.log(`${prefix}Uncaught Exception/Catch`);
        console.log(err, origin);
      });
    } else if (error === "uncaughtExceptionMonitor") {
      process.on(error, (err, origin) => {
        console.log(`${prefix}Uncaught Exception/Catch (MONITOR)`);
        console.log(err, origin);
      });
    } else if (error === "unhandledRejection") {
      process.on(error, (reason, p) => {
        console.log(`${prefix}Unhandled Rejection/Catch`);
        console.log(reason, p);
      });
    }
  }
}

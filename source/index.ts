import { readdir } from 'fs/promises'
import axios from 'axios'

/**
 * Similiar to fs/promises readdir, however supports extension filtering.
 * @param path The path to read
 * @param extension The extension to filter by, or null to not filter by extension
 * @returns A promise that resolves to an array of file names
 */

export async function filesIn(path: string, extension: string | string[] | null = null): Promise<string[]> {
    const extensions = Array.isArray(extension) ? extension : extension ? [extension] : null
  return (await readdir(path)).filter(f => extensions ? extensions.some(v => f.endsWith(v)): true)
}

/**
 * Accepts an image url as a parameter and returns a buffer of the image
 * @param url The url of the image to convert to a buffer
 * @returns A promise that resolves to a buffer of the image
 */
export async function toBuffer(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    return Buffer.from(response.data)
}

export async function dimport(path: string): Promise<any> {
    const file = await import(path)
    return file.default
}

export type EventError = 'unhandledRejection' | 'uncaughtException' | 'uncaughtExceptionMonitor' | 'multipleResolves'

export function handleErrors(errors: EventError | EventError[], prefix: string): void {
    const errs = Array.isArray(errors) ? errors : [errors]

    for (const error of errs) {
        if (error === 'multipleResolves') {
            process.on(error, (type, prom, origin) => {
                console.log(`${prefix}Multiple Resolves`);
                console.log(type, prom, origin);
            });
        } else if (error === 'uncaughtException') {
            process.on(error, (err, origin) => {
                console.log(`${prefix}Uncaught Exception/Catch`);
                console.log(err, origin);
            });
        } else if (error === 'uncaughtExceptionMonitor') {
            process.on(error, (err, origin) => {
                console.log(`${prefix}Uncaught Exception/Catch (MONITOR)`);
                console.log(err, origin);
            });
        } else if (error === 'unhandledRejection') {
            process.on(error, (reason, p) => {
                console.log(`${prefix}Unhandled Rejection/Catch`);
                console.log(reason, p);
            });
        }
    }
}

/**
 * Module of fs-like functions
 */
export const fs = {
    filesIn
}

/**
 * Module of functions which require requests (axios)
 */
export const request = {
    ...axios,
    toBuffer
}

/**
 * Utility functions
 */
export const utility = {
    dimport,
    handleErrors
}

export default { ...{...fs, ...request, ...utility} }
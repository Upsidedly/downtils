import { readdir } from 'fs/promises'
import axios from 'axios'
import {
    ButtonPagination,
    RepliableInteraction,
    ButtonPaginationData,
    ButtonPaginationDataArray,
    ButtonPaginationInteractionOptions,
    ButtonPaginationMessageOptions,
    ButtonPaginationMaxType,
    ButtonPaginationIconType
} from './commands/ButtonPagination.js'
import {
    handleErrors,
    EventError
} from './commands/handleErrors.js'

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

export const discord = {
    /**
     * Makes a Button paginated message for embeds. Works with repliable interactions as well as messages.
     * @param entity The interaction or message to reply to
     * @param data The data to paginate
     * @param options The pagination options
     */
    ButtonPagination,
}

export {
    // Button Pagination
    ButtonPaginationData,
    ButtonPaginationDataArray,
    ButtonPaginationInteractionOptions,
    ButtonPaginationMessageOptions,
    ButtonPaginationMaxType,
    ButtonPaginationIconType,
    RepliableInteraction,

    // Handle Errors
    EventError
}

export default { ...fs, ...request, ...utility, ...discord }
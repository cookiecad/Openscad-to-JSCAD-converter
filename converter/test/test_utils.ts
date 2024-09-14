/**
 * Count the number of occurrences of a search string in the given string.
 * @param search The string to search for
 * @param string The string to search in
 * @returns The number of occurrences of the search string
 */
export const countOf = (search: string, string: string): number => {
  let count = 0
  let index = string.indexOf(search)
  while (index !== -1) {
    count++
    index = string.indexOf(search, index + 1)
  }
  return count
}

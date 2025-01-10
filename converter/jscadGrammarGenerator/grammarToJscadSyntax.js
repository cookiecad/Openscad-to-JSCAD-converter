import { getChildIndex, findValueByType, getStringMemberValue, findContentNameByType, getFieldIndex, getFields } from './utils.js'

// Handlers for different member types
const memberHandlers = {
  SYMBOL: (member) => ({ type: 'symbol', name: member.name }),
  SEQ: (member, baseIndex) => ({ type: 'seq', members: translateSEQ(member, baseIndex) }),
  FIELD: (member) => ({ type: 'field', name: member.name, content: member.content }),
  STRING: (member) => ({ type: 'string', value: member.value }),
  ALIAS: (member) => ({
    type: 'alias',
    name: member.name,
    content: member.content.type === 'SYMBOL' ? { type: 'symbol', name: member.content.name } : member.content
  }),
  CHOICE: (member, baseIndex) => ({
    type: 'choice',
    choices: translateCHOICE(member, baseIndex).choices
  }),
  PREC: (member) => ({
    type: 'prec',
    precedence: member.value,
    content: translateChoiceLikeContent(member.content, 0) // baseIndex may vary
  }),
  PREC_LEFT: (member) => ({
    type: 'prec_left',
    precedence: member.value,
    content: translateChoiceLikeContent(member.content, 0) // baseIndex may vary
  }),
  BLANK: () => ({ type: 'blank' }),
  TOKEN: (member) => ({
    type: 'token',
    content: translateChoiceLikeContent(member.content, 0) // baseIndex may vary
  })
}

function translateChoiceLikeContent (content, baseIndex) { // Added baseIndex parameter
  if (content.type === 'SEQ') {
    return translateSEQ(content, baseIndex) // Pass baseIndex
  } else if (content.type === 'CHOICE') {
    return translateCHOICE(content, baseIndex) // Pass baseIndex if needed
  } else if (content.type === 'SYMBOL') {
    return { type: 'symbol', name: content.name }
  } else if (content.type === 'PATTERN') {
    return translatePATTERN(content)
  } else if (content.type === 'PREC') {
    return memberHandlers.PREC(content)
  } else if (content.type === 'PREC_LEFT') {
    return memberHandlers.PREC_LEFT(content)
  } else if (memberHandlers[content.type]) {
    return memberHandlers[content.type](content)
  } else {
    throw new Error(`Unhandled content type ${content.type}`)
  }
}

function translateCHOICE (def, baseIndex = 0) { // Added baseIndex parameter
  if (!def.members || !Array.isArray(def.members)) {
    throw new Error('Invalid structure for CHOICE definition')
  }

  const choices = def.members.map(member => {
    if (memberHandlers[member.type]) {
      // Pass baseIndex if needed
      return memberHandlers[member.type](member, baseIndex)
    } else {
      throw new Error(`Unhandled member type ${member.type} in CHOICE`)
    }
  })
  return { type: 'choice', choices }
}

function translateSEQ (def, baseIndex = 0) {
  if (!def.members || !Array.isArray(def.members)) {
    throw new Error('Invalid structure for SEQ definition')
  }

  const open = getStringMemberValue(def.members, 0)
  const close = getStringMemberValue(def.members, def.members.length - 1)

  // Slice to exclude 'open' and 'close'
  const innerMembers = def.members.slice(1, def.members.length - 1)

  // Pass the starting index for inner members
  const children = findChildrenSEQ(innerMembers, baseIndex + 1)

  return { open, close, children, separator: '' }
}

function translatePREC_RIGHT (def) { // eslint-disable-line camelcase
  const members = def.content.members
  const open = findValueByType(members, 'STRING')
  const children = getFields(members).map((field) => ({
    childIndex: getFieldIndex(members, field.name),
    name: field.name,
    optional: false
  }))
  return { open, close: '', children, separator: '' }
}

function translateREPEAT (def) {
  if (!def.content || !def.content.members || def.content.members.length === 0) {
    throw new Error("Invalid 'REPEAT' definition structure.")
  }

  const members = def.content.members
  const open = getStringMemberValue(members, 0)
  const close = getStringMemberValue(members, members.length - 1)

  const children = members.map((member, index) => ({
    childIndex: index,
    name: member.name || `anonymous${index}`,
    optional: false
  }))

  return { open, close, children, separator: def.separator || '' }
}

function translatePATTERN (def) {
  return { type: 'pattern', value: def.value }
}

function translatePREC (def) {
  const precedence = def.value
  const content = def.content

  return {
    type: 'prec',
    precedence,
    content: translateChoiceLikeContent(content)
  }
}

function translatePREC_LEFT (def) { // eslint-disable-line camelcase
  const precedence = def.value
  const content = def.content

  return {
    type: 'prec_left',
    precedence,
    content: translateChoiceLikeContent(content)
  }
}

function findChildrenSEQ (members, baseIndex = 0) {
  const repeatContentName = findContentNameByType(members, 'REPEAT')
  if (repeatContentName === '_item') { return 'all' }

  let allChildren = []
  for (let i = 0; i < members.length; i++) {
    const member = members[i]

    // Calculate the actual child index based on the outer SEQ
    const actualIndex = baseIndex + i

    if (member.type === 'SYMBOL') {
      allChildren.push({
        childIndex: actualIndex,
        name: member.name,
        optional: false
      })
    } else if (member.type === 'FIELD' || member.type === 'CHOICE') {
      allChildren.push({
        childIndex: actualIndex,
        name: member.name || 'choice',
        optional: false
      })
    } else if (member.type === 'SEQ') {
      // For nested SEQ, pass the current actualIndex as the new baseIndex
      allChildren = [...allChildren, ...findChildrenSEQ(member.members, actualIndex)]
    } else if (member.type === 'STRING' && i !== 0 && i !== members.length - 1) {
      allChildren.push({
        childIndex: actualIndex,
        name: `string${actualIndex}`,
        optional: false
      })
    }
  }
  return allChildren.length > 0 ? allChildren : []
}

export function translate (data) {
  if (!data || !data.rules || typeof data.rules !== 'object') {
    throw new Error('Invalid data structure for translation')
  }

  const definitions = data.rules
  const jscadSyntax = {}

  for (const [name, definition] of Object.entries(definitions)) {
    if (handlers[definition.type]) {
      try {
        // Start with baseIndex = 0 for top-level rules
        jscadSyntax[name] = handlers[definition.type](definition, 0)
      } catch (error) {
        console.error(`Error processing ${name}:`, error)
      }
    } else {
      throw new Error(`No handler for ${definition.type}`)
    }
  }

  return jscadSyntax
}

const handlers = {
  SEQ: translateSEQ,
  PREC_RIGHT: translatePREC_RIGHT, // eslint-disable-line camelcase
  REPEAT: translateREPEAT,
  CHOICE: translateCHOICE,
  PATTERN: translatePATTERN,
  PREC: translatePREC,
  PREC_LEFT: translatePREC_LEFT, // eslint-disable-line camelcase
  TOKEN: memberHandlers.TOKEN,
  STRING: memberHandlers.STRING // Add the STRING handler
  // Additional handlers can be added here
}

import { getChildIndex, findValueByType, getStringMemberValue, findContentNameByType, getFieldIndex, getFields } from './utils.js';

// Handlers for different member types
const memberHandlers = {
  SYMBOL: (member) => ({ type: 'symbol', name: member.name }),
  SEQ: (member) => ({ type: 'seq', members: translateSEQ(member) }),
  FIELD: (member) => ({ type: 'field', name: member.name, content: member.content }),
  STRING: (member) => ({ type: 'string', value: member.value }),
  ALIAS: (member) => ({
    type: 'alias',
    name: member.name,
    content: member.content.type === 'SYMBOL' ? { type: 'symbol', name: member.content.name } : member.content
  }),
  CHOICE: (member) => ({
    type: 'choice',
    choices: translateCHOICE(member).choices
  }),
  PREC: (member) => ({
    type: 'prec',
    precedence: member.value,
    content: translateChoiceLikeContent(member.content)
  }),
  PREC_LEFT: (member) => ({
    type: 'prec_left',
    precedence: member.value,
    content: translateChoiceLikeContent(member.content)
  }),
  BLANK: () => ({ type: 'blank' }),
  TOKEN: (member) => ({
    type: 'token',
    content: translateChoiceLikeContent(member.content)
  }),
};

function translateChoiceLikeContent(content) {
  if (content.type === 'SEQ') {
    return translateSEQ(content);
  } else if (content.type === 'CHOICE') {
    return translateCHOICE(content);
  } else if (content.type === 'SYMBOL') {
    return { type: 'symbol', name: content.name };
  } else if (content.type === 'PATTERN') {
    return translatePATTERN(content);
  } else if (content.type === 'PREC') {
    return memberHandlers.PREC(content); // Use the PREC handler for nested PREC
  } else if (content.type === 'PREC_LEFT') {
    return memberHandlers.PREC_LEFT(content);
  } else if (memberHandlers[content.type]) {
    return memberHandlers[content.type](content);
  } else {
    throw new Error(`Unhandled content type ${content.type}`);
  }
}

function translateCHOICE(def) {
  if (!def.members || !Array.isArray(def.members)) {
    throw new Error('Invalid structure for CHOICE definition');
  }

  const choices = def.members.map(member => {
    if (memberHandlers[member.type]) {
      return memberHandlers[member.type](member);
    } else {
      throw new Error(`Unhandled member type ${member.type} in CHOICE`);
    }
  });
  return { type: 'choice', choices };
}

function translateSEQ(def) {
  if (!def.members || !Array.isArray(def.members)) {
    throw new Error('Invalid structure for SEQ definition');
  }

  const open = getStringMemberValue(def.members, 0);
  const close = getStringMemberValue(def.members, def.members.length - 1);
  const children = findChildrenSEQ(def.members);
  return { open, close, children, separator: '' };
}

function translatePREC_RIGHT(def) {
  const members = def.content.members;
  const open = findValueByType(members, 'STRING');
  const children = getFields(members).map((field) => ({
    childIndex: getFieldIndex(members, field.name),
    name: field.name,
    optional: false,
  }));
  return { open, close: '', children, separator: '' };
}

function translateREPEAT(def) {
  if (!def.content || !def.content.members || def.content.members.length === 0) {
    throw new Error("Invalid 'REPEAT' definition structure.");
  }

  const members = def.content.members;
  const open = getStringMemberValue(members, 0);
  const close = getStringMemberValue(members, members.length - 1);

  const children = members.map((member, index) => ({
    childIndex: index,
    name: member.name || `anonymous${index}`,
    optional: false,
  }));

  return { open, close, children, separator: def.separator || '' };
}

function translatePATTERN(def) {
  return { type: 'pattern', value: def.value };
}

function translatePREC(def) {
  const precedence = def.value;
  const content = def.content;

  return {
    type: 'prec',
    precedence,
    content: translateChoiceLikeContent(content)
  };
}

function translatePREC_LEFT(def) {
  const precedence = def.value;
  const content = def.content;

  return {
    type: 'prec_left',
    precedence,
    content: translateChoiceLikeContent(content)
  };
}

function findChildrenSEQ(members) {
  const repeatContentName = findContentNameByType(members, 'REPEAT');
  if (repeatContentName === '_item') { return 'all'; }

  let allChildren = [];
  for (let i = 0; i < members.length; i++) {
    const member = members[i];

    if (member.type === 'SYMBOL') {
      allChildren.push({
        childIndex: getChildIndex(members, member.name),
        name: member.name,
        optional: false
      });
    } else if (member.type === 'FIELD' || member.type === 'CHOICE') {
      allChildren.push({
        childIndex: getFieldIndex(members, member.name),
        name: member.name,
        optional: false
      });
    } else if (member.type === 'SEQ') {
      allChildren = [...allChildren, ...findChildrenSEQ(member.members)];
    } else if (member.type === 'STRING' && i !== 0 && i !== members.length - 1) {
      allChildren.push({
        childIndex: i,
        name: `string${i}`,
        optional: false
      });
    }
  }
  return allChildren.length > 0 ? allChildren : [];
}

export function translate(data) {
  if (!data || !data.rules || typeof data.rules !== 'object') {
    throw new Error('Invalid data structure for translation');
  }

  const definitions = data.rules;
  const jscadSyntax = {};

  for (const [name, definition] of Object.entries(definitions)) {
    if (handlers[definition.type]) {
      try {
        jscadSyntax[name] = handlers[definition.type](definition);
      } catch (error) {
        console.error(`Error processing ${name}:`, error);
      }
    } else {
      throw new Error(`No handler for ${definition.type}`);
    }
  }

  return jscadSyntax;
}

const handlers = {
  SEQ: translateSEQ,
  PREC_RIGHT: translatePREC_RIGHT,
  REPEAT: translateREPEAT,
  CHOICE: translateCHOICE,
  PATTERN: translatePATTERN,
  PREC: translatePREC,
  PREC_LEFT: translatePREC_LEFT,
  TOKEN: memberHandlers.TOKEN,
  STRING: memberHandlers.STRING // Add the STRING handler
  // Additional handlers can be added here
};
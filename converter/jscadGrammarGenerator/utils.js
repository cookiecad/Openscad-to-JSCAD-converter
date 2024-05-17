export const Types = {
  STRING: "STRING",
  FIELD: "FIELD",
  SYMBOL: "SYMBOL",
  SEQ: "SEQ",
  PREC_RIGHT: "PREC_RIGHT",
  CHOICE: "CHOICE",
  REPEAT: "REPEAT"
};

export function getChildIndex (members, symbolName) {
  return members.findIndex(
    (member) => member.type === Types.SYMBOL && member.name === symbolName
  )
}

export function getStringMemberValue(members, index) {
  return members[index]?.type === 'STRING' ? members[index].value : '';
}

export function findValueByType(arr, type) {
  return arr.find(member => member.type === type)?.value || '';
}

export function findContentNameByType(arr, type) {
  return arr.find(member => member.type === type)?.content?.name || '';
}

export function getFieldIndex(members, fieldName) {
  return members.findIndex((member) => member.name === fieldName)
}

export function getFields (members) {
  return members.filter((member) =>  member.type === Types.FIELD || member.type === Types.SYMBOL);
}
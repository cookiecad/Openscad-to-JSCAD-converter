import fs from 'fs'
function translate (inputFile, callback) {
  fs.readFile(inputFile, 'utf-8', function (err, data) {
    if (err) {
      console.error(err)
      return callback(err)
    }

    const definitions = JSON.parse(data).rules
    const jscadSyntax = {}

    for (const [name, definition] of Object.entries(definitions)) {
      switch (definition.type) {
        case 'SEQ':
          jscadSyntax[name] = translateSEQ(definition)
          break
        case 'PREC_RIGHT':
          jscadSyntax[name] = translatePREC_RIGHT(definition)
          break
        // Additional cases for other types
      }
    }

    return callback(null, jscadSyntax)
  })
}

function translateSEQ (def) {
  const open = def.members[0].type === 'STRING' ? def.members[0].value : ''
  const close =
    def.members[def.members.length - 1].type === 'STRING'
      ? def.members[def.members.length - 1].value
      : ''
  return {
    open,
    close,
    children: findChildrenSEQ(def.members),
    separator: '' // Assumes no separator for this structure
  }
}
function translatePREC_RIGHT (definition) {
  const members = definition.content.members

  return {
    open: findValueByType(members, 'STRING'),
    close: '', // No closing 'if'
    children: getFields(members).map((field) => ({
      childIndex: getFieldIndex(members, field.name),
      name: field.name,
      optional: false
    })),
    separator: '' // Assumes no separator for this structure
  }
}

function getFieldIndex (members, fieldName) {
  return members.findIndex((member) => member.name === fieldName)
}

function findChildrenSEQ (members) {
  const repeatContentName = findContentNameByType(members, 'REPEAT')
  if (repeatContentName === '_item') {
    return 'all'
  }

  // Handle SYMBOL, FIELD, SEQ, CHOICE, and string type
  let allChildren = []
  for (let i = 0; i < members.length; i++) {
    const member = members[i]

    if (member.type === 'SYMBOL') {
      allChildren.push({
        childIndex: getChildIndex(members, member.name),
        name: member.name,
        optional: false
      })
    } else if (member.type === 'FIELD' || member.type === 'CHOICE') {
      allChildren.push({
        childIndex: getFieldIndex(members, member.name),
        name: member.name,
        optional: false
      })
    } else if (member.type === 'SEQ') {
      allChildren = [...allChildren, ...findChildrenSEQ(member.members)]
    } else if (
      member.type === 'STRING' &&
      i !== 0 &&
      i !== members.length - 1
    ) {
      allChildren.push({
        childIndex: i,
        name: `string${i}`,
        optional: false
      })
    }
  }

  return allChildren.length > 0 ? allChildren : []
}

function getChoices (members) {
  let choiceCounter = 0
  const choices = members.filter((member) => member.type === 'CHOICE')
  return choices.map((choice, index) => {
    choice.name = `choice${choiceCounter++}` // Name property is generated as 'choice0', 'choice1', etc.
    return choice
  })
}

// function findChildrenPREC_RIGHT(members) {
//     const fields = getFields(members);
//     return fields.map(field => ({childIndex: getChildIndex(members, field.name), name: field.name, optional: false}));
// }

function findValueByType (arr, type) {
  const item = arr.find((member) => member.type === type)
  return item ? item.value : ''
}

function findLastValueByType (arr, type) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i].type === type) {
      return arr[i].value
    }
  }
  return ''
}

function findContentNameByType (arr, type) {
  const item = arr.find((member) => member.type === type)
  return item ? item.content.name : ''
}

function getFields (members) {
  return members.filter((member) => member.type === 'FIELD')
}

function getSymbols (members) {
  const symbols = members.filter((member) => member.type === 'SYMBOL')
  return symbols.map((symbol) => ({
    childIndex: getChildIndex(members, symbol.name),
    name: symbol.name,
    optional: false
  }))
}

function getChildIndex (members, symbolName) {
  return members.findIndex(
    (member) => member.type === 'SYMBOL' && member.name === symbolName
  )
}

const file = String.raw`..\tree-sitter-openscad\src\grammar.json`
translate(file, function (err, result) {
  if (err) {
    console.error(err)
    return
  }
  fs.writeFileSync(
    'jscadSyntaxFromGrammar.json',
    JSON.stringify(result, null, 2)
  )

  console.log(result)
})

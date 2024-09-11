export default {
  source_file: {
    open: '',
    close: '',
    children: [
      {
        childIndex: 0,
        name: 'use_statement',
        optional: false
      },
      {
        childIndex: 1,
        name: '_item',
        optional: false
      }
    ],
    separator: ''
  },
  _item: {
    type: 'choice',
    choices: [
      {
        type: 'seq',
        members: {
          open: '',
          close: ';',
          children: [
            {
              childIndex: 0,
              name: 'assignment',
              optional: false
            }
          ],
          separator: ''
        }
      },
      {
        type: 'symbol',
        name: '_statement'
      },
      {
        type: 'symbol',
        name: 'module_declaration'
      },
      {
        type: 'symbol',
        name: 'function_declaration'
      }
    ]
  },
  module_declaration: {
    open: 'module',
    close: '',
    children: [
      {
        childIndex: 1,
        name: 'name',
        optional: false
      },
      {
        childIndex: 2,
        name: 'parameters',
        optional: false
      },
      {
        childIndex: 3,
        name: 'body',
        optional: false
      }
    ],
    separator: ''
  },
  parameters_declaration: {
    open: '(',
    close: ')',
    children: [
      {
        childIndex: 0,
        optional: false
      },
      {
        childIndex: 0,
        optional: false
      }
    ],
    separator: ''
  },
  _parameter_declaration: {
    type: 'choice',
    choices: [
      {
        type: 'alias',
        content: {
          type: 'symbol',
          name: '_variable_name'
        }
      },
      {
        type: 'symbol',
        name: 'assignment'
      }
    ]
  },
  function_declaration: {
    open: 'function',
    close: '',
    children: [
      {
        childIndex: 1,
        name: 'name',
        optional: false
      },
      {
        childIndex: 2,
        name: 'parameters',
        optional: false
      },
      {
        childIndex: 3,
        name: 'string3',
        optional: false
      },
      {
        childIndex: 4,
        name: 'expression',
        optional: false
      }
    ],
    separator: ''
  },
  _statement: {
    type: 'choice',
    choices: [
      {
        type: 'symbol',
        name: 'for_block'
      },
      {
        type: 'symbol',
        name: 'intersection_for_block'
      },
      {
        type: 'symbol',
        name: 'if_block'
      },
      {
        type: 'symbol',
        name: 'let_block'
      },
      {
        type: 'symbol',
        name: 'assign_block'
      },
      {
        type: 'symbol',
        name: 'union_block'
      },
      {
        type: 'symbol',
        name: 'modifier_chain'
      },
      {
        type: 'symbol',
        name: 'transform_chain'
      },
      {
        type: 'symbol',
        name: 'include_statement'
      },
      {
        type: 'symbol',
        name: 'assert_statement'
      },
      {
        type: 'string',
        value: ';'
      }
    ]
  },
  include_statement: {
    open: 'include',
    close: '',
    children: [
      {
        childIndex: 1,
        name: 'include_path',
        optional: false
      }
    ],
    separator: ''
  },
  use_statement: {
    open: 'use',
    close: '',
    children: [
      {
        childIndex: 1,
        name: 'include_path',
        optional: false
      }
    ],
    separator: ''
  },
  include_path: {
    type: 'pattern',
    value: '<[^>]*>'
  },
  assignment: {
    open: '',
    close: '',
    children: [
      {
        childIndex: 0,
        name: 'left',
        optional: false
      },
      {
        childIndex: 1,
        name: 'string1',
        optional: false
      },
      {
        childIndex: 2,
        name: 'right',
        optional: false
      }
    ],
    separator: ''
  },
  union_block: {
    open: '{',
    close: '}',
    children: 'all',
    separator: ''
  },
  for_block: {
    open: 'for',
    close: '',
    children: [
      {
        childIndex: 1,
        name: 'parenthesized_assignments',
        optional: false
      },
      {
        childIndex: 2,
        name: 'body',
        optional: false
      }
    ],
    separator: ''
  },
  intersection_for_block: {
    open: 'intersection_for',
    close: '',
    children: [
      {
        childIndex: 1,
        name: 'parenthesized_assignments',
        optional: false
      },
      {
        childIndex: 2,
        name: 'body',
        optional: false
      }
    ],
    separator: ''
  },
  let_block: {
    open: 'let',
    close: '',
    children: [
      {
        childIndex: 1,
        name: 'parenthesized_assignments',
        optional: false
      },
      {
        childIndex: 2,
        name: 'body',
        optional: false
      }
    ],
    separator: ''
  },
  assign_block: {
    open: 'assign',
    close: '',
    children: [
      {
        childIndex: 1,
        name: 'parenthesized_assignments',
        optional: false
      },
      {
        childIndex: 2,
        name: 'body',
        optional: false
      }
    ],
    separator: ''
  },
  if_block: {
    open: 'if',
    close: '',
    children: [
      {
        childIndex: 1,
        name: 'condition',
        optional: false
      },
      {
        childIndex: 2,
        name: 'consequence',
        optional: false
      }
    ],
    separator: ''
  },
  modifier_chain: {
    open: '',
    close: '',
    children: [
      {
        childIndex: 0,
        name: 'modifier',
        optional: false
      },
      {
        childIndex: 1,
        name: '_statement',
        optional: false
      }
    ],
    separator: ''
  },
  modifier: {
    type: 'choice',
    choices: [
      {
        type: 'string',
        value: '*'
      },
      {
        type: 'string',
        value: '!'
      },
      {
        type: 'string',
        value: '#'
      },
      {
        type: 'string',
        value: '%'
      }
    ]
  },
  transform_chain: {
    open: '',
    close: '',
    children: [
      {
        childIndex: 0,
        name: 'module_call',
        optional: false
      },
      {
        childIndex: 1,
        name: '_statement',
        optional: false
      }
    ],
    separator: ''
  },
  module_call: {
    open: '',
    close: '',
    children: [
      {
        childIndex: 0,
        name: 'name',
        optional: false
      },
      {
        childIndex: 1,
        name: 'arguments',
        optional: false
      }
    ],
    separator: ''
  },
  arguments: {
    open: '(',
    close: ')',
    children: [
      {
        childIndex: 0,
        optional: false
      }
    ],
    separator: ''
  },
  parenthesized_assignments: {
    open: '(',
    close: ')',
    children: [
      {
        childIndex: 0,
        optional: false
      }
    ],
    separator: ''
  },
  parenthesized_expression: {
    open: '(',
    close: ')',
    children: [
      {
        childIndex: 1,
        name: 'expression',
        optional: false
      }
    ],
    separator: ''
  },
  condition_update_clause: {
    open: '(',
    close: ')',
    children: [
      {
        childIndex: 0,
        name: 'initializer',
        optional: false
      },
      {
        childIndex: 1,
        name: 'string1',
        optional: false
      },
      {
        childIndex: 2,
        name: 'condition',
        optional: false
      },
      {
        childIndex: 3,
        name: 'string3',
        optional: false
      },
      {
        childIndex: 4,
        name: 'update',
        optional: false
      }
    ],
    separator: ''
  },
  expression: {
    type: 'choice',
    choices: [
      {
        type: 'symbol',
        name: 'parenthesized_expression'
      },
      {
        type: 'symbol',
        name: 'unary_expression'
      },
      {
        type: 'symbol',
        name: 'binary_expression'
      },
      {
        type: 'symbol',
        name: 'ternary_expression'
      },
      {
        type: 'symbol',
        name: 'let_expression'
      },
      {
        type: 'symbol',
        name: 'function_call'
      },
      {
        type: 'symbol',
        name: 'index_expression'
      },
      {
        type: 'symbol',
        name: 'dot_index_expression'
      },
      {
        type: 'symbol',
        name: 'assert_expression'
      },
      {
        type: 'symbol',
        name: 'literal'
      },
      {
        type: 'symbol',
        name: '_variable_name'
      }
    ]
  },
  let_expression: {
    open: 'let',
    close: '',
    children: [
      {
        childIndex: 1,
        name: 'parenthesized_assignments',
        optional: false
      },
      {
        childIndex: 2,
        name: 'body',
        optional: false
      }
    ],
    separator: ''
  },
  literal: {
    type: 'choice',
    choices: [
      {
        type: 'symbol',
        name: 'string'
      },
      {
        type: 'symbol',
        name: 'number'
      },
      {
        type: 'symbol',
        name: 'boolean'
      },
      {
        type: 'symbol',
        name: 'undef'
      },
      {
        type: 'symbol',
        name: 'function'
      },
      {
        type: 'symbol',
        name: 'range'
      },
      {
        type: 'symbol',
        name: 'list'
      }
    ]
  },
  function: {
    open: 'function',
    close: '',
    children: [
      {
        childIndex: 1,
        name: 'parameters',
        optional: false
      },
      {
        childIndex: 2,
        name: 'body',
        optional: false
      }
    ],
    separator: ''
  },
  range: {
    open: '[',
    close: ']',
    children: [
      {
        childIndex: 0,
        name: 'start',
        optional: false
      },
      {
        childIndex: 1,
        optional: false
      },
      {
        childIndex: 2,
        name: 'string2',
        optional: false
      },
      {
        childIndex: 3,
        name: 'end',
        optional: false
      }
    ],
    separator: ''
  },
  list: {
    open: '[',
    close: ']',
    children: [
      {
        childIndex: 0,
        optional: false
      }
    ],
    separator: ''
  },
  _list_cell: {
    type: 'choice',
    choices: [
      {
        type: 'symbol',
        name: 'expression'
      },
      {
        type: 'symbol',
        name: 'each'
      },
      {
        type: 'symbol',
        name: 'list_comprehension'
      }
    ]
  },
  _comprehension_cell: {
    type: 'choice',
    choices: [
      {
        type: 'symbol',
        name: 'expression'
      },
      {
        type: 'choice',
        choices: [
          {
            type: 'seq',
            members: {
              open: '(',
              close: ')',
              children: [
                {
                  childIndex: 1,
                  name: 'each',
                  optional: false
                }
              ],
              separator: ''
            }
          },
          {
            type: 'symbol',
            name: 'each'
          }
        ]
      },
      {
        type: 'choice',
        choices: [
          {
            type: 'seq',
            members: {
              open: '(',
              close: ')',
              children: [
                {
                  childIndex: 1,
                  name: 'list_comprehension',
                  optional: false
                }
              ],
              separator: ''
            }
          },
          {
            type: 'symbol',
            name: 'list_comprehension'
          }
        ]
      }
    ]
  },
  each: {
    open: 'each',
    close: '',
    children: [
      {
        childIndex: 0,
        optional: false
      }
    ],
    separator: ''
  },
  list_comprehension: {
    open: '',
    close: '',
    children: [
      {
        childIndex: 0,
        optional: false
      }
    ],
    separator: ''
  },
  for_clause: {
    open: 'for',
    close: '',
    children: [
      {
        childIndex: 0,
        optional: false
      },
      {
        childIndex: 2,
        name: '_comprehension_cell',
        optional: false
      }
    ],
    separator: ''
  },
  if_clause: {
    open: 'if',
    close: '',
    children: [
      {
        childIndex: 1,
        name: 'condition',
        optional: false
      },
      {
        childIndex: 2,
        name: 'consequence',
        optional: false
      }
    ],
    separator: ''
  },
  function_call: {
    type: 'prec',
    precedence: 10,
    content: {
      open: '',
      close: '',
      children: [
        {
          childIndex: 0,
          name: 'function',
          optional: false
        },
        {
          childIndex: 1,
          name: 'arguments',
          optional: false
        }
      ],
      separator: ''
    }
  },
  index_expression: {
    type: 'prec',
    precedence: 10,
    content: {
      open: '',
      close: '',
      children: [
        {
          childIndex: 0,
          name: 'value',
          optional: false
        },
        {
          childIndex: 1,
          name: 'index',
          optional: false
        }
      ],
      separator: ''
    }
  },
  dot_index_expression: {
    type: 'prec',
    precedence: 10,
    content: {
      open: '',
      close: '',
      children: [
        {
          childIndex: 0,
          name: 'value',
          optional: false
        },
        {
          childIndex: 1,
          name: 'string1',
          optional: false
        },
        {
          childIndex: 2,
          name: 'index',
          optional: false
        }
      ],
      separator: ''
    }
  },
  unary_expression: {
    type: 'choice',
    choices: [
      {
        type: 'prec',
        precedence: 9,
        content: {
          open: '!',
          close: '',
          children: [
            {
              childIndex: 1,
              name: 'expression',
              optional: false
            }
          ],
          separator: ''
        }
      },
      {
        type: 'prec_left',
        precedence: 6,
        content: {
          open: '-',
          close: '',
          children: [
            {
              childIndex: 1,
              name: 'expression',
              optional: false
            }
          ],
          separator: ''
        }
      },
      {
        type: 'prec_left',
        precedence: 6,
        content: {
          open: '+',
          close: '',
          children: [
            {
              childIndex: 1,
              name: 'expression',
              optional: false
            }
          ],
          separator: ''
        }
      }
    ]
  },
  binary_expression: {
    type: 'choice',
    choices: [
      {
        type: 'prec_left',
        precedence: 2,
        content: {
          open: '',
          close: '',
          children: [
            {
              childIndex: 0,
              name: 'left',
              optional: false
            },
            {
              childIndex: 1,
              name: 'string1',
              optional: false
            },
            {
              childIndex: 2,
              name: 'right',
              optional: false
            }
          ],
          separator: ''
        }
      },
      {
        type: 'prec_left',
        precedence: 3,
        content: {
          open: '',
          close: '',
          children: [
            {
              childIndex: 0,
              name: 'left',
              optional: false
            },
            {
              childIndex: 1,
              name: 'string1',
              optional: false
            },
            {
              childIndex: 2,
              name: 'right',
              optional: false
            }
          ],
          separator: ''
        }
      },
      {
        type: 'prec_left',
        precedence: 4,
        content: {
          open: '',
          close: '',
          children: [
            {
              childIndex: 0,
              name: 'left',
              optional: false
            },
            {
              childIndex: 1,
              name: 'string1',
              optional: false
            },
            {
              childIndex: 2,
              name: 'right',
              optional: false
            }
          ],
          separator: ''
        }
      },
      {
        type: 'prec_left',
        precedence: 4,
        content: {
          open: '',
          close: '',
          children: [
            {
              childIndex: 0,
              name: 'left',
              optional: false
            },
            {
              childIndex: 1,
              name: 'string1',
              optional: false
            },
            {
              childIndex: 2,
              name: 'right',
              optional: false
            }
          ],
          separator: ''
        }
      },
      {
        type: 'prec_left',
        precedence: 5,
        content: {
          open: '',
          close: '',
          children: [
            {
              childIndex: 0,
              name: 'left',
              optional: false
            },
            {
              childIndex: 1,
              name: 'string1',
              optional: false
            },
            {
              childIndex: 2,
              name: 'right',
              optional: false
            }
          ],
          separator: ''
        }
      },
      {
        type: 'prec_left',
        precedence: 5,
        content: {
          open: '',
          close: '',
          children: [
            {
              childIndex: 0,
              name: 'left',
              optional: false
            },
            {
              childIndex: 1,
              name: 'string1',
              optional: false
            },
            {
              childIndex: 2,
              name: 'right',
              optional: false
            }
          ],
          separator: ''
        }
      },
      {
        type: 'prec_left',
        precedence: 5,
        content: {
          open: '',
          close: '',
          children: [
            {
              childIndex: 0,
              name: 'left',
              optional: false
            },
            {
              childIndex: 1,
              name: 'string1',
              optional: false
            },
            {
              childIndex: 2,
              name: 'right',
              optional: false
            }
          ],
          separator: ''
        }
      },
      {
        type: 'prec_left',
        precedence: 5,
        content: {
          open: '',
          close: '',
          children: [
            {
              childIndex: 0,
              name: 'left',
              optional: false
            },
            {
              childIndex: 1,
              name: 'string1',
              optional: false
            },
            {
              childIndex: 2,
              name: 'right',
              optional: false
            }
          ],
          separator: ''
        }
      },
      {
        type: 'prec_left',
        precedence: 6,
        content: {
          open: '',
          close: '',
          children: [
            {
              childIndex: 0,
              name: 'left',
              optional: false
            },
            {
              childIndex: 1,
              name: 'string1',
              optional: false
            },
            {
              childIndex: 2,
              name: 'right',
              optional: false
            }
          ],
          separator: ''
        }
      },
      {
        type: 'prec_left',
        precedence: 6,
        content: {
          open: '',
          close: '',
          children: [
            {
              childIndex: 0,
              name: 'left',
              optional: false
            },
            {
              childIndex: 1,
              name: 'string1',
              optional: false
            },
            {
              childIndex: 2,
              name: 'right',
              optional: false
            }
          ],
          separator: ''
        }
      },
      {
        type: 'prec_left',
        precedence: 7,
        content: {
          open: '',
          close: '',
          children: [
            {
              childIndex: 0,
              name: 'left',
              optional: false
            },
            {
              childIndex: 1,
              name: 'string1',
              optional: false
            },
            {
              childIndex: 2,
              name: 'right',
              optional: false
            }
          ],
          separator: ''
        }
      },
      {
        type: 'prec_left',
        precedence: 7,
        content: {
          open: '',
          close: '',
          children: [
            {
              childIndex: 0,
              name: 'left',
              optional: false
            },
            {
              childIndex: 1,
              name: 'string1',
              optional: false
            },
            {
              childIndex: 2,
              name: 'right',
              optional: false
            }
          ],
          separator: ''
        }
      },
      {
        type: 'prec_left',
        precedence: 7,
        content: {
          open: '',
          close: '',
          children: [
            {
              childIndex: 0,
              name: 'left',
              optional: false
            },
            {
              childIndex: 1,
              name: 'string1',
              optional: false
            },
            {
              childIndex: 2,
              name: 'right',
              optional: false
            }
          ],
          separator: ''
        }
      },
      {
        type: 'prec_left',
        precedence: 8,
        content: {
          open: '',
          close: '',
          children: [
            {
              childIndex: 0,
              name: 'left',
              optional: false
            },
            {
              childIndex: 1,
              name: 'string1',
              optional: false
            },
            {
              childIndex: 2,
              name: 'right',
              optional: false
            }
          ],
          separator: ''
        }
      }
    ]
  },
  ternary_expression: {
    open: '?',
    close: '',
    children: [
      {
        childIndex: 0,
        name: 'condition',
        optional: false
      },
      {
        childIndex: 2,
        name: 'consequence',
        optional: false
      },
      {
        childIndex: 4,
        name: 'alternative',
        optional: false
      }
    ],
    separator: ''
  },
  _assert_clause: {
    open: 'assert',
    close: '',
    children: [
      {
        childIndex: 0,
        optional: false
      }
    ],
    separator: ''
  },
  assert_statement: {
    open: '',
    close: '',
    children: [
      {
        childIndex: 0,
        name: '_assert_clause',
        optional: false
      },
      {
        childIndex: 1,
        name: '_statement',
        optional: false
      }
    ],
    separator: ''
  },
  assert_expression: {
    open: '',
    close: '',
    children: [
      {
        childIndex: 0,
        name: '_assert_clause',
        optional: false
      },
      {
        childIndex: 1,
        name: 'expression',
        optional: false
      }
    ],
    separator: ''
  },
  identifier: {
    type: 'pattern',
    value: '[a-zA-Z_]\\w*'
  },
  special_variable: {
    open: '$',
    close: '',
    children: [
      {
        childIndex: 1,
        name: 'identifier',
        optional: false
      }
    ],
    separator: ''
  },
  _variable_name: {
    type: 'choice',
    choices: [
      {
        type: 'symbol',
        name: 'identifier'
      },
      {
        type: 'symbol',
        name: 'special_variable'
      }
    ]
  },
  string: {
    type: 'token',
    content: {
      open: '"',
      close: '"',
      children: [],
      separator: ''
    }
  },
  number: {
    type: 'choice',
    choices: [
      {
        type: 'symbol',
        name: 'decimal'
      },
      {
        type: 'symbol',
        name: 'float'
      }
    ]
  },
  decimal: {
    type: 'token',
    content: {
      type: 'pattern',
      value: '-?\\d+'
    }
  },
  float: {
    type: 'token',
    content: {
      type: 'pattern',
      value: '-?(\\d+(\\.\\d+)?|\\.\\d+)(e-?\\d+)?'
    }
  },
  boolean: {
    type: 'choice',
    choices: [
      {
        type: 'string',
        value: 'true'
      },
      {
        type: 'string',
        value: 'false'
      }
    ]
  },
  undef: {
    type: 'string',
    value: 'undef'
  },
  comment: {
    type: 'token',
    content: {
      type: 'choice',
      choices: [
        {
          type: 'seq',
          members: {
            open: '//',
            close: '',
            children: [],
            separator: ''
          }
        },
        {
          type: 'seq',
          members: {
            open: '/*',
            close: '/',
            children: [],
            separator: ''
          }
        }
      ]
    }
  }
}

import JsonView from '@uiw/react-json-view';
import React from 'react';

export default function JsonViewer({ data }) {
  return <JsonView value={data} displayDataTypes={false}/>;
}
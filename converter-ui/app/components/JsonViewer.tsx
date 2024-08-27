import JsonView from '@uiw/react-json-view';
import React from 'react';

interface JsonViewerProps {
  data: any;
}

export default function JsonViewer({ data }: JsonViewerProps) {
  return data && <JsonView value={data} displayDataTypes={false}/>;
}
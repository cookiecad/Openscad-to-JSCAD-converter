import React from 'react';
import { JsonView, collapseAllNested, allExpanded, darkStyles, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

interface JsonViewerProps {
  data: any;
}

export default function JsonViewer({ data }: JsonViewerProps) {
  return data && <JsonView data={data} style={defaultStyles} shouldExpandNode={allExpanded} />;
}


// import JsonView from '@uiw/react-json-view';
// interface JsonViewerProps {
//   data: any;
// }
// export default function JsonViewer({ data }: JsonViewerProps) {
//   return data && <JsonView value={data} displayDataTypes={false}/>;
// }
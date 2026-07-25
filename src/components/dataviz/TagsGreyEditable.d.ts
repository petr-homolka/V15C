import * as React from 'react';
export interface TagsGreyEditableProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Tag". */
  text1?: string;
  /** Text content; defaults to "". */
  text2?: string;
}
export declare const TagsGreyEditable: React.FC<TagsGreyEditableProps>;
export default TagsGreyEditable;

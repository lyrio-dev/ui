import React, { lazy, Suspense } from "react";
import { Placeholder } from "semantic-ui-react";
import type { MarkdownContentProps } from "./MarkdownContent";

export type { MarkdownContentPatcher, MarkdownContentProps } from "./MarkdownContent";

const load = () => import("./MarkdownContent");
const MarkdownContent = lazy(load);

export interface LazyMarkdownContentProps extends MarkdownContentProps {
  placeholderLines?: number;
}

const LazyMarkdownContent: React.FC<LazyMarkdownContentProps> = props => {
  const loading = (
    <Placeholder>
      {[...Array(props.placeholderLines || 4).keys()].map(i => (
        <Placeholder.Line key={i} />
      ))}
    </Placeholder>
  );
  return (
    <Suspense fallback={loading}>
      <MarkdownContent {...props} />
    </Suspense>
  );
};

export default Object.assign(LazyMarkdownContent, {
  load
});

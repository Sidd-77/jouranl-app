import React, { useEffect, useRef, useState } from "react";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  ListsToggle,
  Separator,
  StrikeThroughSupSubToggles,
  InsertThematicBreak,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  isLoading?: boolean;
}

export function Editor({ content, onChange, isLoading = false }: EditorProps) {
  const editorRef = useRef<any>(null);
  const [localContent, setLocalContent] = useState(content);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  useEffect(() => {
    if (editorRef.current && localContent !== editorRef.current.getMarkdown()) {
      editorRef.current.setMarkdown(localContent);
    }
  }, [localContent]);

  const handleChange = (newContent: string) => {
    setLocalContent(newContent);
    onChange(newContent);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full border rounded-lg bg-gray-50 animate-pulse">
        <div className="h-full flex items-center justify-center text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full border rounded-lg overflow-auto">
      <MDXEditor
        ref={editorRef}
        markdown={localContent}
        onChange={handleChange}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          markdownShortcutPlugin(),
          markdownShortcutPlugin(),
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <div className="overflow-x-auto">
                <div className="flex flex-nowrap gap-2 p-2 border-b min-w-max">
                  <BlockTypeSelect />
                  <BoldItalicUnderlineToggles />
                  <Separator orientation="vertical" className="h-6" />
                  <StrikeThroughSupSubToggles />
                  <Separator orientation="vertical" className="h-6" />
                  <ListsToggle />
                  <Separator orientation="vertical" className="h-6" />
                  <InsertThematicBreak />
                  <CodeToggle />
                </div>
              </div>
            ),
          }),
        ]}
        contentEditableClassName="prose max-w-none p-4 min-h-[calc(100vh-200px)]"
        className="h-full max-w-none"
      />
    </div>
  );
}

export default Editor;

"use client";

import { toRichBlocks } from "../utils";

type Props = { text: string };

export function DescriptionRichText({ text }: Props) {
  const blocks = toRichBlocks(text);

  return (
    <div className="rich-text">
      {blocks.map((b, idx) => {
        if (b.type === "h") {
          return (
            <div key={idx} className="rich-text__h">
              {b.text}
            </div>
          );
        }

        if (b.type === "ul") {
          return (
            <ul key={idx} className="rich-text__ul">
              {b.items.map((it, i) => (
                <li key={i} className="rich-text__li">
                  {it}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={idx} className="rich-text__p">
            {b.text}
          </p>
        );
      })}
    </div>
  );
}

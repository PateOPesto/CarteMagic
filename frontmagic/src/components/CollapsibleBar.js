import * as React from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../ui/collapsible"; // adapte selon ton import
import "./CollapsibleBar.css";

export default function CollapsibleBar({ open, setOpen, children, title }) {
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="collapsible-root">
      <CollapsibleTrigger className="collapsible-trigger">
        <span>{title}</span>
        <svg
          className={`arrow-icon ${open ? "open" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </CollapsibleTrigger>

      <CollapsibleContent className="collapsible-content">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

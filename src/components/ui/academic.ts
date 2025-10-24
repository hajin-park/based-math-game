/**
 * Academic Theme Components
 * 
 * Enhanced UI components with academic textbook/notes/papers styling.
 * These components extend the base shadcn/ui components with unique
 * visual elements inspired by scholarly materials.
 */

// Paper Card - Card with paper texture and optional folded corner
export {
  PaperCard,
  PaperCardHeader,
  PaperCardFooter,
  PaperCardTitle,
  PaperCardDescription,
  PaperCardContent,
  type PaperCardProps,
} from "./paper-card";

// Sticky Note - Post-it style callout component
export {
  StickyNote,
  StickyNoteTitle,
  StickyNoteDescription,
  type StickyNoteProps,
} from "./sticky-note";

// Notebook Input - Input with ruled lines and academic styling
export {
  NotebookInput,
  notebookInputVariants,
  type NotebookInputProps,
} from "./notebook-input";

// Section Header - Consistent heading component with optional icon and underline
export {
  SectionHeader,
  sectionHeaderVariants,
  titleVariants,
  type SectionHeaderProps,
} from "./section-header";

// Ruled Separator - Notebook-style separator with optional double line
export {
  RuledSeparator,
  ruledSeparatorVariants,
  type RuledSeparatorProps,
} from "./ruled-separator";


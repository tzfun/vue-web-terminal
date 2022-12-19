export interface DragableConfType {
  width: number | string;
  height: number | string;
  zIndex?: number;
  init?: {
    x?: number;
    y?: number;
  };
}

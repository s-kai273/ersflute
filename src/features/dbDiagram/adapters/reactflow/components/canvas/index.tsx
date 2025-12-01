import "@xyflow/react/dist/style.css";
import { ReactFlowProvider } from "@xyflow/react";
import { Internal } from "./internal";

export const Canvas = () => {
  return (
    <ReactFlowProvider>
      <Internal />
    </ReactFlowProvider>
  );
};

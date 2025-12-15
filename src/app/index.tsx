import { DbDiagram } from "@/features/dbDiagram";
import { EntryScreen } from "@/features/entryScreen";
import { ErrorDialog } from "@/features/errorDialog";
import { Toolbar } from "@/features/toolbar";
import { useErmFileStore } from "@/stores/ermFileStore";
import { useSetupMenu } from "./useSetupMenu";
import "./index.css";

function App() {
  useSetupMenu();
  const { isLoaded } = useErmFileStore();
  return (
    <>
      <ErrorDialog />
      {isLoaded ? (
        <div className="flex h-screen w-screen bg-slate-100">
          <Toolbar />
          <main className="flex flex-1">
            <DbDiagram />
          </main>
        </div>
      ) : (
        <EntryScreen />
      )}
    </>
  );
}

export default App;

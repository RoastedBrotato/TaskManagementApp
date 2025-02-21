import TaskTable from "./components/TaskTable";

function App() {
  return (
    <div className="min-h-screen bg-white">
      <div className="w-full sm:max-w-7xl sm:mx-auto sm:p-6">
      <h1 className="text-2xl font-bold m-4">Task Manager</h1>
        <TaskTable />
      </div>
    </div>
  );
}

export default App;

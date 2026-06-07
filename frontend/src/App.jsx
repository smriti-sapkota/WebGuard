import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ScannerPage from "./pages/ScannerPage";
import ResultsPage from "./pages/ResultsPage";
import useScan from "./hooks/useScan";

export default function App() {
  const [page, setPage] = useState("home");

  const {
    form,
    setField,
    scanId,
    status,
    target,
    updatedAt,
    vulns,
    message,
    scanning,
    startScan,
    stopPolling,
  } = useScan();

  return (
    <>
      <Header page={page} setPage={setPage} />

      {page === "home" && <HomePage setPage={setPage} />}

      {page === "scanner" && (
        <ScannerPage
          form={form}
          setField={setField}
          scanning={scanning}
          startScan={startScan}
          stopPolling={stopPolling}
          scanId={scanId}
          status={status}
          target={target}
          updatedAt={updatedAt}
        />
      )}

      {page === "results" && <ResultsPage vulns={vulns} message={message} />}

      <Footer />
    </>
  );
}

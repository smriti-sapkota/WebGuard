import { useState, useCallback } from "react";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ScannerPage from "./pages/ScannerPage";
import ResultsPage from "./pages/ResultsPage";
import useScan from "./hooks/useScan";

export default function App() {
  const [page, setPage] = useState("home");
  const { user, loading } = useAuth();
  const goScanner = useCallback(() => setPage("scanner"), []);

  // Scanner/results need a login
  const shown =
    !loading && !user && (page === "scanner" || page === "results")
      ? "login"
      : page;

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
      <Header page={shown} setPage={setPage} />

      {shown === "home" && <HomePage setPage={setPage} />}

      {shown === "login" && <LoginPage onDone={goScanner} />}

      {shown === "scanner" && (
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

      {shown === "results" && <ResultsPage vulns={vulns} message={message} />}

      <Footer />
    </>
  );
}

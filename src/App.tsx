import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { ReactComponent as DownIcon } from "./assets/down.svg";

const placeholder = "/party/placeholder.webp";

const flagMap: Record<string, string> = {
  JOHOR: "/state/johor.png",
  KEDAH: "/state/kedah.png",
  KELANTAN: "/state/kelantan.png",
  MELAKA: "/state/melaka.png",
  "NEGERI SEMBILAN": "/state/negeri-sembilan.png",
  PAHANG: "/state/pahang.png",
  PERAK: "/state/perak.png",
  PERLIS: "/state/perlis.png",
  "PULAU PINANG": "/state/pulau-pinang.png",
  SABAH: "/state/sabah.png",
  SARAWAK: "/state/sarawak.png",
  SELANGOR: "/state/selangor.png",
  TERENGGANU: "/state/terengganu.png",
  "WP KUALA LUMPUR": "/state/wp-kuala-lumpur.webp",
  "WP LABUAN": "/state/wp-labuan.png",
  "WP PUTRAJAYA": "/state/wp-putrajaya.png",
};

const partyMap: Record<string, string> = {
  BN: "/party/bn.png",
  PKR: "/party/pkr.png",
  PAS: "/party/pas.png",
  // BEBAS: "/party/bebas.png",
  PRM: "/party/prm.png",
  PAP: "/party/pap.png",
  PSM: "/party/psm.png",
  BERJASA: "/party/berjasa.png",
  MU: "/party/mu.jpg",
  PCM: "/party/pcm.jpg",
  PFP: "/party/pfp.png",
  PPRS: "/party/pprs.png",
  WARISAN: "/party/warisan.png",
  PCS: "/party/pcs.png",
  // HR: "/party/hr.png",
  SAPP: "/party/sapp.jpg",
  DAP: "/party/dap.png",
  ANAKNEGERI: "/party/anaknegeri.jpg",
  // SOLIDARITI: "/party/solidariti.png",
  AMANAH: "/party/amanah.png",
  STAR: "/party/star.png",
  PBDSB: "/party/pbdsb.jpg",
  PBK: "/party/pbk.png",
  PEACE: "/party/peace.jpg",
};

type Result = {
  negeri?: string;
  bahagianPilihanRaya?: string;
  namaCalon?: string;
  parti?: string;
  bilanganUndi?: number;
  status?: string | null;
};

function App() {
  const [results, setResults] = useState<Result[]>();
  const [selectedState, setSelectedState] = useState<string>();
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    fetch("result.json")
      .then((res) => res.json())
      .then((res: Result[]) => {
        setResults(res);

        if (!!res[0].negeri) {
          setSelectedState(res[0].negeri);
        }
      });
  }, []);

  const groupByState = useMemo(() => {
    const res: Record<string, Record<string, Result[]>> = {};

    results?.forEach((r) => {
      if (!r.negeri || !r.bahagianPilihanRaya) return;

      if (!res[r.negeri]) res[r.negeri] = {};
      if (!res[r.negeri][r.bahagianPilihanRaya]) {
        res[r.negeri][r.bahagianPilihanRaya] = [];
      }

      res[r.negeri][r.bahagianPilihanRaya].push(r);
    });

    for (const state in res) {
      for (const zone in res[state]) {
        res[state][zone].sort(
          ({ bilanganUndi: a = 0 }, { bilanganUndi: b = 0 }) => b - a
        );
      }
    }

    return res;
  }, [results]);

  console.log(DownIcon);

  const states = useMemo(() => {
    return [...new Set(results?.map((r) => r.negeri))];
  }, [results]);

  console.log(filterOpen);
  return (
    <>
      <h2>Malaysia 14th General Election Parliament Result</h2>

      <button onClick={() => setFilterOpen((open) => !open)}>
        Select State <DownIcon className="toggle-icon" data-open={filterOpen} />
      </button>

      {filterOpen && (
        <>
          <div className="states">
            {states.map((state) => {
              if (!state) return null;

              return (
                <label htmlFor={state} key={state} className="state-label">
                  <div className="state" data-checked={selectedState === state}>
                    <input
                      style={{ visibility: "hidden", display: "none" }}
                      type="checkbox"
                      checked={selectedState === state}
                      onChange={() => {
                        setFilterOpen(false);
                        setSelectedState(state);
                      }}
                      id={state}
                    />
                    <div>
                      <img
                        src={flagMap[state]}
                        width={25}
                        style={{
                          border: "1px #0000001f solid",
                          maxWidth: "100%",
                        }}
                      />{" "}
                      {state}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
          <hr />
        </>
      )}
      {selectedState && (
        <>
          <div>
            <div style={{ background: "#ffffff1f" }}>
              <h3>{selectedState}</h3>

              {Object.keys(groupByState[selectedState]).map((zone) => {
                return (
                  <div key={zone} className="zone-wrapper">
                    <div className="zone">
                      <span>{zone}</span>
                    </div>
                    <div className="candidates">
                      {groupByState[selectedState][zone].map((datum) => {
                        return (
                          <div
                            key={datum.namaCalon}
                            className="candidate"
                            data-status={datum.status}
                          >
                            <span className="party">
                              {datum.parti && (
                                <img
                                  src={partyMap[datum.parti] ?? placeholder}
                                  alt={datum.parti}
                                  className="party-flag"
                                />
                              )}
                              <span>{datum.parti}</span>
                            </span>
                            <span>
                              {datum.namaCalon}{" "}
                              <strong>[{datum.bilanganUndi}]</strong>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <span>
              Disclaimer: All data is obtained from{" "}
              <a href="https://www.data.gov.my/" target="_blank">
                DATA TERBUKA
              </a>
            </span>
          </div>
        </>
      )}
    </>
  );
}

export default App;

import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { ReactComponent as DownIcon } from "./assets/down.svg";

const BASE_URL = import.meta.env.BASE_URL;

const placeholder = `${BASE_URL}party/placeholder.webp`;

const flagMap: Record<string, string> = {
  JOHOR: `${BASE_URL}state/johor.png`,
  KEDAH: `${BASE_URL}state/kedah.png`,
  KELANTAN: `${BASE_URL}state/kelantan.png`,
  MELAKA: `${BASE_URL}state/melaka.png`,
  "NEGERI SEMBILAN": `${BASE_URL}state/negeri-sembilan.png`,
  PAHANG: `${BASE_URL}state/pahang.png`,
  PERAK: `${BASE_URL}state/perak.png`,
  PERLIS: `${BASE_URL}state/perlis.png`,
  "PULAU PINANG": `${BASE_URL}state/pulau-pinang.png`,
  SABAH: `${BASE_URL}state/sabah.png`,
  SARAWAK: `${BASE_URL}state/sarawak.png`,
  SELANGOR: `${BASE_URL}state/selangor.png`,
  TERENGGANU: `${BASE_URL}state/terengganu.png`,
  "WP KUALA LUMPUR": `${BASE_URL}state/wp-kuala-lumpur.webp`,
  "WP LABUAN": `${BASE_URL}state/wp-labuan.png`,
  "WP PUTRAJAYA": `${BASE_URL}state/wp-putrajaya.png`,
};

const partyMap: Record<string, string> = {
  BN: `${BASE_URL}party/bn.png`,
  PKR: `${BASE_URL}party/pkr.png`,
  PAS: `${BASE_URL}party/pas.png`,
  // BEBAS: `${BASE_URL}party/bebas.png`,
  PRM: `${BASE_URL}party/prm.png`,
  PAP: `${BASE_URL}party/pap.png`,
  PSM: `${BASE_URL}party/psm.png`,
  BERJASA: `${BASE_URL}party/berjasa.png`,
  MU: `${BASE_URL}party/mu.jpg`,
  PCM: `${BASE_URL}party/pcm.jpg`,
  PFP: `${BASE_URL}party/pfp.png`,
  PPRS: `${BASE_URL}party/pprs.png`,
  WARISAN: `${BASE_URL}party/warisan.png`,
  PCS: `${BASE_URL}party/pcs.png`,
  // HR: `${BASE_URL}party/hr.png`,
  SAPP: `${BASE_URL}party/sapp.jpg`,
  DAP: `${BASE_URL}party/dap.png`,
  ANAKNEGERI: `${BASE_URL}party/anaknegeri.jpg`,
  // SOLIDARITI: `${BASE_URL}party/solidariti.png`,
  AMANAH: `${BASE_URL}party/amanah.png`,
  STAR: `${BASE_URL}party/star.png`,
  PBDSB: `${BASE_URL}party/pbdsb.jpg`,
  PBK: `${BASE_URL}party/pbk.png`,
  PEACE: `${BASE_URL}party/peace.jpg`,
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
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedState, setSelectedState] = useState<string>();
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    fetch("result.json")
      .then((res) => res.json())
      .then((res: Result[]) => {
        setResults(res);
        setLoading(false);

        if (res[0].negeri) {
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

  const states = useMemo(() => {
    return [...new Set(results?.map((r) => r.negeri))];
  }, [results]);

  const filter = useMemo(() => {
    const toggle = (
      <button onClick={() => setFilterOpen((open) => !open)}>
        Select State <DownIcon className="toggle-icon" data-open={filterOpen} />
      </button>
    );

    if (!filterOpen) return toggle;

    return (
      <>
        {toggle}
        <div className="states">
          {states.map((state) => {
            if (!state) return null;

            return (
              <label htmlFor={state} key={state} className="state-label">
                <div className="state" data-checked={selectedState === state}>
                  <input
                    className="checkbox"
                    type="checkbox"
                    checked={selectedState === state}
                    onChange={() => {
                      setFilterOpen(false);
                      setSelectedState(state);
                    }}
                    id={state}
                  />
                  <div>
                    <img src={flagMap[state]} width={25} className="flag-img" />{" "}
                    {state}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
        <hr />
      </>
    );
  }, [filterOpen, states, selectedState]);

  const content = useMemo(() => {
    if (!selectedState) return null;

    return (
      <div>
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
    );
  }, [groupByState, selectedState]);

  return (
    <>
      <h2>Malaysia 14th General Election Parliament Result</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {filter}
          {content}
        </>
      )}

      <div>
        <span>
          Disclaimer: All data is obtained from{" "}
          <a href="https://www.data.gov.my/" target="_blank">
            DATA TERBUKA
          </a>
        </span>
      </div>
    </>
  );
}

export default App;

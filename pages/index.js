import styles from "./Home.module.css";

import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";

export default function Home() {
  return (
    <div className="container">
     <Navbar/>
      <div>
        <Sidebar />
        <main>
          <div>
            <div className="squares">
              <div className="squares-title">
                Total de Ventas del dia de <b className={styles.test}>hoy</b>
              </div>
              <div className="squares-info">$10.00</div>
            </div>
            <div className="squares">
              <div className="squares-title">Ventas del dia de hoy</div>
              <div className="squares-info">20</div>
            </div>
          </div>
          <section></section>
        </main>
      </div>
    </div>
  );
}

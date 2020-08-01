import styles from "./Home.module.css";
import Head from "next/head";

import { Sidebar } from "./components/Sidebar";

export default function Home() {
  return (
    <div className="container">
      <nav>
        <div>
          <div className="store-image"></div>
          <div className="store-name">Store Name</div>
        </div>

        <div>
          <div className="search-bar">
            <i className="search-bar-icon" data-feather="search"></i>
          </div>
        </div>
        <div>
          <div className="profile-image"></div>
          <div className="nav-user">John Doe</div>
        </div>
      </nav>
      <div>
        <Sidebar />
        <main>
          <div>
            <div className="squares">
              <div className="squares-title">
                Total de Ventas del dia de <b className={styles.test}>hoy</b>
              </div>
              <div class="squares-info">$10.00</div>
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

import Head from "next/head";

export default function newProduct() {
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
        <aside>
          <div className="sections">
            <div>
              <i data-feather="home"></i>
              <div className="sections-info">Home</div>
            </div>
            <div>
              <i data-feather="shopping-bag"></i>
              <div className="sections-info">Orders</div>
            </div>
            <div>
              <i data-feather="box"></i>
              <div className="sections-info">Products</div>
            </div>
            <div>
              <i data-feather="users"></i>
              <div className="sections-info">Costumers</div>
            </div>
            <div>
              <i data-feather="trending-up"></i>
              <div className="sections-info">Reports</div>
            </div>
          </div>

          <div className="settings"></div>
        </aside>
        <main>
          <div></div>
          <section></section>
        </main>
      </div>
    </div>
  );
}

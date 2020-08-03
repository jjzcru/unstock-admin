import Head from "next/head";
import styles from "./new.module.css";

import { Sidebar } from "../../components/Sidebar";
import { Navbar } from "../../components/Navbar";

export default function Products() {
  return (
    <div className="container">
      <Navbar />
      <div>
        <Sidebar />
        <main className={styles["main"]}>
          <Topbar />
          <Content />
        </main>
      </div>
    </div>
  );
}

function Topbar() {
  return (
    <div className={styles["top-bar"]}>
      <div className={styles["new-product-title"]}>
        <button> &lt; Products</button>
        <h3>Add Product</h3>
      </div>

      <button className={styles["add-button"]}>Save</button>
    </div>
  );
}

function Content() {
  return (
    <div className={styles["new-product-content"]}>
      <div>
        <div className={styles["new-producto-info-title"]}>
          <h3>Title</h3>
          <div>
            <input
              type="text"
              className={styles["new-producto-info-title-input"]}
            />
          </div>
        </div>
        <div className={styles["new-producto-info-images"]}>
          <div className={styles["new-producto-info-images-title"]}>
            <h3>Images</h3>
            <button className={styles["add-button"]}>Upload</button>
          </div>
          <div></div>
        </div>
        <div className={styles["new-producto-info-pricing"]}>
          <h3>Pricing</h3>
          <div className={styles["new-producto-info-pricing-box"]}>
            <div>
              <h3 className={styles["new-producto-info-pricing-title"]}>
                Title
              </h3>
              <div>
                <input
                  type="text"
                  className={styles["new-producto-info-pricing-input"]}
                />
              </div>
            </div>
            <div>
              <h3 className={styles["new-producto-info-pricing-title"]}>
                Compare At
              </h3>
              <div>
                <input
                  type="text"
                  className={styles["new-producto-info-pricing-input"]}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={styles["new-producto-info-inventory"]}>
          <h3>Inventory</h3>
          <div className={styles["new-producto-info-inventory-box"]}>
            <div>
              <div>
                <h3 className={styles["new-producto-info-pricing-title"]}>
                  SKU (Stock Keeping Unit)
                </h3>
                <input
                  type="text"
                  className={styles["new-producto-info-pricing-input"]}
                />
              </div>
              <div>
                <h3 className={styles["new-producto-info-pricing-title"]}>
                  Inventory Policy
                </h3>
                <input
                  type="text"
                  className={styles["new-producto-info-pricing-input"]}
                />
              </div>
            </div>
            <div>
              <div>
                <h3 className={styles["new-producto-info-pricing-title"]}>
                  Barcode (ISBN, UPC, GTIN)
                </h3>
                <input
                  type="text"
                  className={styles["new-producto-info-pricing-input"]}
                />
              </div>
              <div>
                <h3 className={styles["new-producto-info-pricing-title"]}>
                  Quantity
                </h3>
                <input
                  type="text"
                  className={styles["new-producto-info-pricing-input"]}
                />
              </div>
            </div>
          </div>
          <div className={styles["new-producto-info-inventory-checkbox"]}>
            <input type="checkbox" id="allow" />
            <label htmlFor="allow">
              Allow customers to purchase this product when its out of stock
            </label>
          </div>
        </div>
        <div className={styles["new-producto-info-shipping"]}>
          <h3>Shipping</h3>
          <div className={styles["new-producto-info-shipping-box"]}>
            <div>
              <h3 className={styles["new-producto-info-pricing-title"]}>
                Weight
              </h3>
              <input
                type="text"
                className={styles["new-producto-info-shipping-box-input"]}
              />
            </div>
            <div>
              <h3 className={styles["new-producto-info-pricing-title"]}>
                Fullfillment Service
              </h3>
              <input
                type="text"
                className={styles["new-producto-info-shipping-box-input"]}
              />
            </div>
          </div>
        </div>
        <div className={styles["new-producto-info-variants"]}>
          {" "}
          <h3>Variants</h3>
          <div>
            <p>Add variants if this product comes in multiple version</p>
          </div>
        </div>
      </div>
      <div>
        <div className={styles["new-producto-organize-box"]}>
          <h3>Organize</h3>
          <div className={styles["new-producto-info-organize-box-inputs"]}>
            <div>
              <div>
                <h3 className={styles["new-producto-info-pricing-title"]}>
                  Category
                </h3>
                <input
                  type="text"
                  className={styles["new-producto-info-organize-box-input"]}
                />
              </div>
              <div>
                <h3 className={styles["new-producto-info-pricing-title"]}>
                  Vendor
                </h3>
                <input
                  type="text"
                  className={styles["new-producto-info-organize-box-input"]}
                />
              </div>
            </div>
            <div>
              <div>
                <h3 className={styles["new-producto-info-pricing-title"]}>
                  Tags
                </h3>
                <input
                  type="text"
                  className={styles["new-producto-info-organize-box-input"]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

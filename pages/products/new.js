import React, { useState, useEffect } from "react";
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
          <Content />
        </main>
      </div>
    </div>
  );
}

class Content extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      storeId: "869a39ff-c8b2-4ef6-9617-86eafcf39e16",
      name: "iPhone 12",
      price: 899.99,
      compareAt: 0,

      sku: "",
      barcode: "",
      inventoryPolicy: "block",
      quantity: 20,

      shippingWeight: "",
      fullfilment: null,

      category: [],
      vendor: "Apple",
      tags: [],
    };
  }

  componentDidMount() {}

  handleCreateProduct = () => {
    const product = this.state;
    console.log(product);
    this.createProduct(product);
  };

  createProduct = async (data) => {
    let post = fetch("/api/products", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (res.status === 200) {
          alert("Producto creado exitosamente");
          window.history.back();
        } else alert("Error creando el producto");
        res.json().then((body) => {
          console.log(body);
        });
      })
      .catch(console.error);
  };

  onTitleChange = (title) => {
    this.setState({
      name: title,
    });
  };

  onPricingChange = (price, compareAt) => {
    console.log(price);
    this.setState({
      price,
      compareAt,
    });
  };

  onInventoryChange = (sku, inventoryPolicy, barcode, quantity) => {
    this.setState({
      sku,
      inventoryPolicy,
      barcode,
      quantity,
    });
  };

  onShippingChange = (shippingWeight, fullfilment) => {
    this.setState({
      shippingWeight,
      fullfilment,
    });
  };

  render() {
    let {
      name,
      price,
      compareAt,
      sku,
      barcode,
      inventoryPolicy,
      quantity,
      shippingWeight,
      fullfilment,
      category,
      vendor,
      tags,
    } = this.state;
    return (
      <div>
        <div className={styles["top-bar"]}>
          <div className={styles["new-product-title"]}>
            <button> &lt; Products</button>
            <h3>Add Product</h3>
          </div>

          <button
            className={styles["add-button"]}
            onClick={() => this.handleCreateProduct()}
          >
            Save
          </button>
        </div>
        <div className={styles["new-product-content"]}>
          <div>
            <Title name={name} onChange={this.onTitleChange} />
            <div className={styles["new-product-info-images"]}>
              <div className={styles["new-product-info-images-title"]}>
                <h3>Images</h3>
                <button className={styles["add-button"]}>Upload</button>
              </div>
              <div></div>
            </div>
            <Pricing
              price={price}
              compareAt={compareAt}
              onChange={this.onPricingChange}
            />
            <Inventory
              sku={sku}
              barcode={barcode}
              inventoryPolicy={inventoryPolicy}
              quantity={quantity}
              onChange={this.onInventoryChange}
            />
            <Shipping
              shippingWeight={shippingWeight}
              fullfilment={fullfilment}
              onChange={this.onShippingChange}
            />
            <div className={styles["new-product-info-variants"]}>
              {" "}
              <h3>Variants</h3>
              <div>
                <p>Add variants if this product comes in multiple version</p>
              </div>
            </div>
          </div>
          <div>
            <Organize />
          </div>
        </div>
      </div>
    );
  }
}

function Title({ name, onChange }) {
  return (
    <div className={styles["new-product-info-title"]}>
      <h3>Title</h3>
      <div>
        <input
          type="text"
          className={styles["new-product-info-title-input"]}
          value={name}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function Pricing({ price, compareAt, onChange }) {
  return (
    <div className={styles["new-product-info-pricing"]}>
      <h3>Pricing</h3>
      <div className={styles["new-product-info-pricing-box"]}>
        <div>
          <h3 className={styles["new-product-info-pricing-title"]}>Price</h3>
          <div>
            <input
              type="number"
              className={styles["new-product-info-pricing-input"]}
              value={price}
              onChange={(e) => {
                onChange(e.target.value, compareAt);
              }}
            />
          </div>
        </div>
        <div>
          <h3 className={styles["new-product-info-pricing-title"]}>
            Compare At
          </h3>
          <div>
            <input
              type="number"
              className={styles["new-product-info-pricing-input"]}
              value={compareAt}
              onChange={(e) => {
                onChange(price, e.target.value);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Organize() {
  const [vendor, setVendor] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");

  return (
    <div className={styles["new-product-organize-box"]}>
      <h3>Organize</h3>
      <div className={styles["new-product-info-organize-box-inputs"]}>
        <div>
          <div>
            <h3 className={styles["new-product-info-pricing-title"]}>
              Category
            </h3>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={styles["new-product-info-organize-box-input"]}
            />
          </div>
          <div>
            <h3 className={styles["new-product-info-pricing-title"]}>Vendor</h3>
            <input
              type="text"
              className={styles["new-product-info-organize-box-input"]}
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
            />
          </div>
        </div>
        <div>
          <div>
            <h3 className={styles["new-product-info-pricing-title"]}>Tags</h3>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={styles["new-product-info-organize-box-input"]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Inventory({ sku, inventoryPolicy, barcode, quantity, onChange }) {
  return (
    <div className={styles["new-product-info-inventory"]}>
      <h3>Inventory</h3>
      <div className={styles["new-product-info-inventory-box"]}>
        <div>
          <div>
            <h3 className={styles["new-product-info-pricing-title"]}>
              SKU (Stock Keeping Unit)
            </h3>
            <input
              type="text"
              className={styles["new-product-info-pricing-input"]}
              value={sku}
              onChange={(e) => {
                onChange(e.target.value, inventoryPolicy, barcode, quantity);
              }}
            />
          </div>
          <div>
            <h3 className={styles["new-product-info-pricing-title"]}>
              Inventory Policy
            </h3>
            <select
              className={styles["new-product-info-pricing-input"]}
              onChange={(e) => {
                onChange(sku, e.target.value, barcode, quantity);
              }}
            >
              <option value="block">Block</option>
              <option value="allow">Allow</option>
            </select>
          </div>
        </div>
        <div>
          <div>
            <h3 className={styles["new-product-info-pricing-title"]}>
              Barcode (ISBN, UPC, GTIN)
            </h3>
            <input
              type="text"
              className={styles["new-product-info-pricing-input"]}
              value={barcode}
              onChange={(e) => {
                onChange(sku, inventoryPolicy, e.target.value, quantity);
              }}
            />
          </div>
          <div>
            <h3 className={styles["new-product-info-pricing-title"]}>
              Quantity
            </h3>
            <input
              type="number"
              className={styles["new-product-info-pricing-input"]}
              value={quantity}
              onChange={(e) => {
                onChange(sku, inventoryPolicy, barcode, e.target.value);
              }}
            />
          </div>
        </div>
      </div>
      <div className={styles["new-product-info-inventory-checkbox"]}>
        <input type="checkbox" id="allow" />
        <label htmlFor="allow">
          Allow customers to purchase this product when its out of stock
        </label>
      </div>
    </div>
  );
}

function Shipping({ shippingWeight, fullfilment, onChange }) {
  return (
    <div className={styles["new-product-info-shipping"]}>
      <h3>Shipping</h3>
      <div className={styles["new-product-info-shipping-box"]}>
        <div>
          <h3 className={styles["new-product-info-pricing-title"]}>Weight</h3>
          <input
            type="text"
            className={styles["new-product-info-shipping-box-input"]}
            value={shippingWeight}
            onChange={(e) => onChange(e.target.value, fullfilment)}
          />
        </div>
        <div>
          <h3 className={styles["new-product-info-pricing-title"]}>
            Fullfillment Service
          </h3>

          <select
            className={styles["new-product-info-shipping-box-input"]}
            onChange={(e) => onChange(shippingWeight, e.target.value)}
          >
            <option value="ASAP">ASAP</option>
            <option value="appetitto24">appetitto24</option>
          </select>
        </div>
      </div>
    </div>
  );
}

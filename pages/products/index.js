import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "./Products.module.css";

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
      <div className={styles["title"]}>
        <h2>Products</h2>
      </div>
      <Link href="/products/new">
        <AddProductButton />
      </Link>
    </div>
  );
}

const AddProductButton = React.forwardRef(({ onClick, href }, ref) => {
  return (
    <button className={styles["add-button"]}>
      <a href={href} onClick={onClick} ref={ref}>
        Add Product
      </a>
    </button>
  );
});

class Content extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
    };
  }

  componentDidMount() {
    this.getData()
      .then((products) => {
        this.setState({ products });
      })
      .catch(console.error);
  }

  getData = async () => {
    let query = await fetch("/api/products");
    const data = await query.json();
    return data.products;
  };
  render() {
    const { products } = this.state;
    return (
      <div className={styles["content"]}>
        <input
          type="text"
          className={styles["search-bar"]}
          placeholder="Search Products"
        />

        <div className={styles["products"]}>
          <table className={styles["products-table"]}>
            <thead className={styles["products-table-header"]}>
              <tr>
                <th></th>
                <th></th>
                <th>Product</th>
                <th>Inventory</th>
                <th>Type</th>
                <th>Vendor</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, i) => {
                return (
                  <Product
                    key={i}
                    title={product.name}
                    type={product.type}
                    vendor={product.vendor}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

function Product({ id, title, inventory, type, vendor }) {
  return (
    <tr className={styles["product-row"]}>
      <td className={styles["product-selection"]}>
        <input type="checkbox" />
      </td>
      <td className={styles["product-image-container"]}>
        <div className={styles["product-image"]}></div>
      </td>
      <td className={styles["product-title"]}>{title}</td>
      <td className={styles["product-inventory"]}>X in stock for Y variants</td>
      <td className={styles["product-type"]}>{type}</td>
      <td className={styles["product-vendor"]}>{vendor}</td>
    </tr>
  );
}

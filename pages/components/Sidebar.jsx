import styles from "./Sidebar.module.css";

export function Sidebar() {
  const sections = [
    {
      icon: "/static/icons/home.svg",
      title: "Home",
    },
    {
      icon: "/static/icons/orders.svg",
      title: "Orders",
    },
    {
      icon: "/static/icons/products.svg",
      title: "Products",
    },
    {
      icon: "/static/icons/costumers.svg",
      title: "Costumers",
    },
    {
      icon: "/static/icons/reports.svg",
      title: "Reports",
    },
  ];
  return (
    <aside>
      <div className={styles["sections"]}>
        {sections.map((section) => {
          return (
            <div className={styles["section"]}>
              <img className={styles["icon"]} src={section.icon} />
              <div className={styles["title"]}>{section.title}</div>
            </div>
          );
        })}
      </div>

      <div className="settings"></div>
    </aside>
  );
}

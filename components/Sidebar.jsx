import React, { useState } from 'react';
import Link from 'next/link';

import styles from './Sidebar.module.css';

export function Sidebar({ lang }) {
    const [collapsed, setCollapsed] = useState(false);
    const sections = [
        {
            icon: '/static/icons/home.svg',
            title: lang['HOME'],
            url: '/',
        },
        {
            icon: '/static/icons/orders.svg',
            title: lang['ORDERS'],
            url: '/orders',
        },
        {
            icon: '/static/icons/products.svg',
            title: lang['PRODUCTS'],
            url: '/products',
        },
        {
            icon: '/static/icons/costumers.svg',
            title: lang['COSTUMERS'],
            url: '/',
        },
        {
            icon: '/static/icons/reports.svg',
            title: lang['REPORTS'],
            url: '/',
        },
        {
            icon: '/static/icons/credit-card.svg',
            title: lang['BILLING'],
            url: '/billing',
        },
    ];

    const onCollapseClick = () => {
        setCollapsed(!collapsed);
    };

    return (
        <aside
            className={
                collapsed ? styles['sidebar-collapsed'] : styles['sidebar']
            }
        >
            <div className={styles['sections']}>
                {sections.map((section, i) => (
                    <Section
                        key={i}
                        icon={section.icon}
                        title={section.title}
                        url={section.url}
                        isCollapsed={collapsed}
                    />
                ))}
            </div>

            <div
                style={{ marginBottom: '20px', cursor: 'pointer' }}
                onClick={onCollapseClick}
            >
                <div style={{ marginLeft: '20px' }}>
                    <img
                        src={
                            collapsed
                                ? '/static/icons/chevrons-right.svg'
                                : '/static/icons/chevrons-left.svg'
                        }
                    />
                </div>
            </div>
        </aside>
    );
}

function Section({ icon, title, url, isCollapsed }) {
    let style = {};
    if (isCollapsed) {
        style = {
            opacity: 0,
            position: 'absolute',
        };
    }
    return (
        <div className={styles['section']}>
            <img className={styles['icon']} src={icon} />
            <div className={styles['title']} style={style}>
                <Link href={url}>
                    <a>{title}</a>
                </Link>
            </div>
        </div>
    );
}

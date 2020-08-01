import styles from './Navbar.module.css';

export function Navbar() {
	return (
		<nav className={styles['navbar']}>
			<div className={styles['store']}>
				<div className={styles['store-image']}></div>
				<div className={styles['store-name']}>Store Name</div>
			</div>

			<div>
				<div  className={styles['search-bar']}>
                    <img src={'/static/icons/search.svg'} />
				</div>
			</div>
			<div className={styles['profile']}>
				<div className={styles['profile-image']}></div>
                <div className={styles['profile-name']}>John Doe</div>
			</div>
		</nav>
	);
}
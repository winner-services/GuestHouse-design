import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom"

function SidebarPage() {
    let userdata = JSON.parse(localStorage.getItem('user'))
    let permissions = userdata.permissions
    const isiPhone = /iPhone/.test(navigator.userAgent);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const toggleDropdown = (key) => {
        setActiveDropdown(activeDropdown === key ? null : key);
    };

    const sidebarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                sidebarRef.current.classList.remove('active');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside); // for iPhones

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    return <>
        <aside ref={sidebarRef} className="sidebar ">
            <button type="button"
                className="sidebar-close-btn text-gray-500 hover-text-white hover-bg-main-600 text-md w-24 h-24 border border-gray-100 hover-border-main-600 d-xl-none d-flex flex-center rounded-circle position-absolute"><i
                    className="ph ph-x"></i></button>

            <a href="#"
                className="sidebar__logo text-center p-20 position-sticky inset-block-start-0 bg-white w-100 z-1 pb-10">
                {/* <img src="/assets/images/logo/logo.png" alt="Logo"/> */}
                <h4 className="text-success">JOHN SERVICES MOTEL</h4>
            </a>

            <div className="sidebar-menu-wrapper overflow-y-auto scroll-sm">
                <div className="p-20 pt-10 mb-3">
                    <ul className="sidebar-menu">
                        <li className="sidebar-menu__item">
                            <NavLink to="/main" className="sidebar-menu__link">
                                <span className="icon"><i className="ph ph-squares-four"></i></span>
                                <span className="text">Tableau de bord</span>
                            </NavLink>
                        </li>
                        {permissions.includes("Gérer Partenaires") ? (
                            <li className="sidebar-menu__item has-dropdown">
                                <a href="#" className="sidebar-menu__link" onClick={() => toggleDropdown("partner")}>
                                    <span className="icon"><i className="ph ph-users"></i></span>
                                    <span className="text">Partenaires</span>
                                </a>

                                <ul className="sidebar-submenu" style={{ display: activeDropdown === "partner" ? "block" : "none" }}>
                                    <li className="sidebar-submenu__item">
                                        <NavLink to="/main/clients" className="sidebar-submenu__link"> Clients </NavLink>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <NavLink to="/main/suppliers" className="sidebar-submenu__link"> Fournisseurs </NavLink>
                                    </li>
                                </ul>

                            </li>
                        ) : null}


                        {permissions.includes("Gérer Magasin") ? (
                            <li className="sidebar-menu__item has-dropdown">
                                <a href="#" className="sidebar-menu__link" onClick={() => toggleDropdown("magasin")}>
                                    <span className="icon"><i className="ph ph-bag"></i></span>
                                    <span className="text">Magasin</span>
                                </a>

                                <ul className="sidebar-submenu" style={{ display: activeDropdown === "magasin" ? "block" : "none" }}>

                                    <li className="sidebar-submenu__item">
                                        <div className="btn-group">
                                            <a href="#" className="sidebar-submenu__link" data-bs-toggle="dropdown" aria-expanded="false">
                                                Restaurant
                                            </a>
                                            <ul className="dropdown-menu">
                                                <li><NavLink to="/main/products" className="dropdown-item">Produits</NavLink></li>
                                                <li><NavLink to="/main/pourchases" className="dropdown-item">Approvisionnements</NavLink></li>
                                                <li><NavLink to="/main/sortie-stock" className="dropdown-item">Tranfert Stock</NavLink></li>
                                            </ul>
                                        </div>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <div className="btn-group">
                                            <a href="#" className="sidebar-submenu__link" data-bs-toggle="dropdown" aria-expanded="false">
                                                Hotellerie
                                            </a>
                                            <ul className="dropdown-menu">
                                                <li><NavLink to="/main/fournitures" className="dropdown-item">Autres Fournitures</NavLink></li>
                                                <li><NavLink to="/main/fournitures-approvisionement" className="dropdown-item">Commandes Fournitures</NavLink></li>
                                                <li><NavLink to="/main/fournitures-acquisition" className="dropdown-item">Acquisitions</NavLink></li>
                                            </ul>
                                        </div>
                                    </li>

                                </ul>
                            </li>
                        ) : null}



                        {permissions.includes("Gérer Cuisine") ? (
                            <li className="sidebar-menu__item has-dropdown">
                                <a href="#" className="sidebar-menu__link" onClick={() => toggleDropdown("cuisine")}>
                                    <span className="icon"><i className="ph ph-house"></i></span>
                                    <span className="text">Cuisine</span>
                                </a>

                                <ul className="sidebar-submenu" style={{ display: activeDropdown === "cuisine" ? "block" : "none" }}>
                                    <li className="sidebar-submenu__item">
                                        <NavLink to="/main/comand-kitchen" className="sidebar-submenu__link"> Commandes </NavLink>
                                    </li>
                                </ul>
                            </li>
                        ) : null}

                        {permissions.includes("Gérer Hôtellerie") ? (
                            <li className="sidebar-menu__item has-dropdown">
                                <a href="#" className="sidebar-menu__link" onClick={() => toggleDropdown("hotelerie")}>
                                    <span className="icon"><i className="ph ph-bed"></i></span>
                                    <span className="text">Hôtellerie</span>
                                </a>

                                <ul className="sidebar-submenu" style={{ display: activeDropdown === "hotelerie" ? "block" : "none" }}>
                                    <li className="sidebar-submenu__item">
                                        <NavLink to="/main/affectations-chambres" className="sidebar-submenu__link"> Affectations </NavLink>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <NavLink to="/main/affectations-chambres-historique" className="sidebar-submenu__link"> Historique</NavLink>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <NavLink to="/main/affectations-edited-chambres-historique" className="sidebar-submenu__link"> Historique Modifiées</NavLink>
                                    </li>
                                </ul>
                            </li>
                        ) : null}

                        {permissions.includes("Gérer BarResto") ? (
                            <li className="sidebar-menu__item has-dropdown">
                                <a href="#" className="sidebar-menu__link" onClick={() => toggleDropdown("restaurant")}>
                                    <span className="icon"><i className="ph ph-coffee"></i></span>
                                    <span className="text">Restaurant</span>
                                </a>

                                <ul className="sidebar-submenu" style={{ display: activeDropdown === "restaurant" ? "block" : "none" }}>
                                    <li className="sidebar-submenu__item">
                                        <NavLink to="/main/restaurant-supply" className="sidebar-submenu__link"> Gestion Commandes </NavLink>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <NavLink to="/main/ventes" className="sidebar-submenu__link">Point de Vente </NavLink>
                                    </li>
                                </ul>

                            </li>
                        ) : null}

                        {permissions.includes("Gérer Comptabilité") ? (
                            <li className="sidebar-menu__item has-dropdown">
                                <a href="#" className="sidebar-menu__link" onClick={() => toggleDropdown("compte")}>
                                    <span className="icon"><i className="ph ph-money"></i></span>
                                    <span className="text">Comptabilité</span>
                                </a>

                                <ul className="sidebar-submenu" style={{ display: activeDropdown === "compte" ? "block" : "none" }}>
                                    <li className="sidebar-submenu__item">
                                        <NavLink to="/main/transactions-tresorerie" className="sidebar-submenu__link"> Transactions </NavLink>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <NavLink to="/main/compte-tresorerie" className="sidebar-submenu__link"> Comptes de tresorerie</NavLink>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <NavLink to="/main/compte-comptables" className="sidebar-submenu__link"> Comptes comptables</NavLink>
                                    </li>
                                </ul>

                            </li>
                        ) : null}

                        {permissions.includes("Gérer Rapports") ? (
                            <li className="sidebar-menu__item">
                                <NavLink to="/main/rapports" className="sidebar-menu__link">
                                    <span className="icon"><i className="ph ph-squares-four"></i></span>
                                    <span className="text">Rapports</span>
                                </NavLink>
                            </li>
                        ) : null}

                        {permissions.includes("Gérer Paramètres") ? (
                            <li className="sidebar-menu__item has-dropdown mb-8">
                                <a href="#" className="sidebar-menu__link" onClick={() => toggleDropdown("settings")}>
                                    <span className="icon"><i className="ph ph-gear"></i></span>
                                    <span className="text">Parametres</span>
                                </a>
                                <ul className="sidebar-submenu pb-8" style={{ display: activeDropdown === "settings" ? "block" : "none" }}>
                                    <li className="sidebar-submenu__item">
                                        <NavLink to="/main/roles-users" className="sidebar-submenu__link">Roles</NavLink>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <NavLink to="/main/users" className="sidebar-submenu__link">Utilisateurs</NavLink>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <NavLink to="/main/departements" className="sidebar-submenu__link">Departements</NavLink>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <NavLink to="/main/rooms" className="sidebar-submenu__link">Chambres</NavLink>
                                    </li>
                                    <li className="sidebar-submenu__item">
                                        <NavLink to="/main/devises" className="sidebar-submenu__link pb-10">Devises</NavLink>
                                    </li>
                                </ul>
                            </li>
                        ) : null}


                    </ul>
                </div>
            </div>

        </aside>
    </>
}

export default SidebarPage